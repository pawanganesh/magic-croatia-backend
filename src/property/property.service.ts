import { PrismaClient, Property } from '@prisma/client';
import HttpException from 'exceptions/HttpException';
import { InfiniteScrollResponse } from 'types/express/custom';
import UserService from 'user/user.service';
import {
  CreatePropertyDto,
  PropertySearchParams,
  PropertyWithBookings,
} from './property.interface';

class PropertyService {
  private userService: UserService;
  private prisma: PrismaClient;
  private PER_PAGE = 5;

  constructor(userService: UserService, prisma: PrismaClient) {
    this.userService = userService;
    this.prisma = prisma;
  }

  public getLatestProperties = async (userUid: string) => {
    const currentUser = await this.userService.findUserByUid(userUid);

    const latestProperties = await this.prisma.property.findMany({
      where: {
        NOT: {
          userId: currentUser.id,
        },
      },
      take: 5,
      orderBy: {
        createdAt: 'desc',
      },
    });

    return latestProperties;
  };

  public getPropertiesFromSearch = async (
    params: PropertySearchParams,
    userUid: string,
  ): Promise<InfiniteScrollResponse<Property>> => {
    const currentUser = await this.userService.findUserByUid(userUid);

    const take = this.PER_PAGE;
    const { search, cursor } = params;
    const parsedCursor = { id: +cursor };
    const skip = parsedCursor.id > 1 ? 1 : 0;

    const properties = await this.prisma.property.findMany({
      take,
      cursor: parsedCursor,
      skip,
      where: {
        AND: [
          {
            address: {
              contains: search,
              mode: 'insensitive',
            },
          },
          {
            NOT: {
              userId: currentUser.id,
            },
          },
        ],
      },
      orderBy: {
        id: 'asc',
      },
    });

    const lastProperty = properties[take - 1];
    const nextCursor = lastProperty ? { id: lastProperty.id } : null;
    return { items: properties, nextCursor };
  };

  public getProperty = async (
    propertyId: number,
  ): Promise<PropertyWithBookings> => {
    const property = await this.prisma.property.findFirst({
      where: { id: propertyId },
      include: {
        bookings: {
          select: {
            rating: true,
            review: true,
          },
          take: 5,
        },
      },
    });
    if (!property) {
      throw new HttpException(404, `Property #${propertyId} not found!`);
    }

    return property;
  };

  public getMyProperties = async (userId: number) => {
    const properties = await this.prisma.property.findMany({
      where: { userId },
    });
    return properties;
  };

  public getMyPropertyNames = async (userId: number) => {
    const propertyNames = await this.prisma.property.findMany({
      where: { userId },
      select: { name: true },
    });
    return propertyNames.map((p) => p.name);
  };

  public createProperty = async (propertyData: CreatePropertyDto) => {
    const myPropertyNames = await this.getMyPropertyNames(propertyData.userId);
    if (myPropertyNames.includes(propertyData.name)) {
      throw new HttpException(400, 'Property name already exists!');
    }
    const property = await this.prisma.property.create({
      data: {
        ...propertyData,
      },
    });
    if (property) {
      await this.userService.updateUserRoleToLandlord(propertyData.userId);
    } else {
      throw new HttpException(500, 'Property not created!');
    }
    return property;
  };

  public calculatePropertyAverageRating = async (propertyId: number) => {
    const propertyBookings = await this.prisma.property.findFirst({
      where: { id: propertyId },
      include: {
        bookings: {
          select: {
            rating: true,
          },
        },
      },
    });

    const totalRating = propertyBookings.bookings.reduce(
      (acc, item) => acc + parseFloat(item.rating.toString()),
      0,
    );

    const averageRating = totalRating / propertyBookings.bookings.length;
    await this.prisma.property.update({
      where: { id: propertyId },
      data: {
        averageRating: parseFloat(
          parseFloat(averageRating.toString()).toFixed(2),
        ),
        numberOfReviews: propertyBookings.bookings.length,
      },
    });
  };
}

export default PropertyService;
