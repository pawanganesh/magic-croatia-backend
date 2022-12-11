import { PrismaClient, Property } from '@prisma/client';
import HttpException from 'exceptions/HttpException';
import { InfiniteScrollResponse } from 'types/express/custom';
import UserService from 'user/user.service';
import {
  CreatePropertyDto,
  PropertySearchParams,
  PropertyWithReviews,
} from './property.interface';

class PropertyService {
  private userService: UserService;
  private prisma: PrismaClient;
  private PER_PAGE = 5;

  constructor(prisma: PrismaClient, userService: UserService) {
    this.prisma = prisma;
    this.userService = userService;
  }

  public getPopularProperties = async (userId: number) => {
    const popularProperties = await this.prisma.property.findMany({
      where: { NOT: { userId } },
      take: 5,
      orderBy: {
        averageRating: 'desc',
      },
    });

    return popularProperties;
  };

  public getLatestProperties = async (userId: number) => {
    const latestProperties = await this.prisma.property.findMany({
      where: {
        NOT: {
          userId,
        },
      },
      take: 5,
      orderBy: {
        createdAt: 'asc',
      },
    });

    return latestProperties;
  };

  public getUserProperties = async (userId: number) => {
    const properties = await this.prisma.property.findMany({
      where: { userId },
    });
    return properties;
  };

  public getSearchProperties = async (
    params: PropertySearchParams,
    userId: number,
  ): Promise<InfiniteScrollResponse<Property>> => {
    const take = this.PER_PAGE;
    const { search, cursor, minPrice, maxPrice, persons, startDate, endDate } =
      params;

    const parsedStartDate = startDate ? new Date(startDate) : undefined;
    const parsedEndDate = endDate ? new Date(endDate) : undefined;
    const parsedPersons = persons ? +persons : undefined;
    const parsedMaxPrice = maxPrice ? +maxPrice : undefined;
    const parsedMinPrice = minPrice ? +minPrice : undefined;
    const parsedUserId = +userId;
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
              userId: parsedUserId,
            },
          },
          {
            pricePerNight: {
              lte: parsedMaxPrice,
              gt: parsedMinPrice,
            },
          },
          {
            persons: {
              gte: parsedPersons,
            },
          },
          {
            bookings: {
              none: {
                OR: [
                  {
                    startDate: {
                      gt: parsedStartDate,
                      lte: parsedEndDate,
                    },
                  },
                  {
                    endDate: {
                      gt: parsedStartDate,
                      lt: parsedEndDate,
                    },
                  },
                ],
              },
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
  ): Promise<PropertyWithReviews> => {
    const property = await this.prisma.property.findFirst({
      where: { id: propertyId },
      include: {
        reviews: {
          select: {
            rating: true,
            reviewText: true,
          },
          take: 5,
        },
        propertyExtras: true,
      },
    });
    if (!property) {
      throw new HttpException(404, `Property #${propertyId} not found!`);
    }
    return property;
  };

  public createProperty = async (
    createPropertyDto: CreatePropertyDto & { userId: number },
  ) => {
    const userProperties = await this.getUserProperties(
      createPropertyDto.userId,
    );
    const userPropertyNames = userProperties.map((property) => property.name);
    if (userPropertyNames.includes(createPropertyDto.name)) {
      throw new HttpException(400, 'Property name already exists!');
    }

    const property = await this.prisma.property.create({
      data: {
        ...createPropertyDto,
        propertyExtras: undefined,
      },
    });
    if (property) {
      await this.userService.updateUserRoleToLandlord(createPropertyDto.userId);
    } else {
      throw new HttpException(500, 'Property not created!');
    }
    await this.prisma.propertyExtras.create({
      data: {
        propertyId: property.id,
        ...createPropertyDto.propertyExtras,
      },
    });
    return property;
  };

  public calculatePropertyAverageRating = async (propertyId: number) => {
    const propertyBookings = await this.prisma.property.findFirst({
      where: { id: propertyId },
      include: {
        reviews: {
          select: {
            rating: true,
          },
        },
      },
    });

    const totalRating = propertyBookings.reviews.reduce(
      (acc, item) => acc + parseFloat(item.rating.toString()),
      0,
    );

    const averageRating = totalRating / propertyBookings.reviews.length;
    await this.prisma.property.update({
      where: { id: propertyId },
      data: {
        averageRating: parseFloat(
          parseFloat(averageRating.toString()).toFixed(2),
        ),
        numberOfReviews: propertyBookings.reviews.length,
      },
    });
  };
}

export default PropertyService;
