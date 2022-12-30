import { PrismaClient, Property } from '@prisma/client';
import HttpException from 'exceptions/HttpException';
import { InfiniteScrollResponse } from 'types/express/custom';
import {
  CreatePropertyDto,
  PropertyQuickSearch,
  PropertySearchParams,
  PropertyTypeFilter,
  PropertyWithReviews,
} from './property.interface';

class PropertyService {
  private prisma: PrismaClient;
  private PER_PAGE = 5;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  public getPopularProperties = async (
    userId: string,
    params: PropertyQuickSearch,
  ) => {
    const type =
      params.type === PropertyTypeFilter.ALL ? undefined : params.type;

    const popularProperties = await this.prisma.property.findMany({
      where: { NOT: { userId }, type },
      take: this.PER_PAGE,
      orderBy: {
        averageRating: 'desc',
      },
    });

    return popularProperties;
  };

  public getLatestProperties = async (
    userId: string,
    params: PropertyQuickSearch,
  ) => {
    const type =
      params.type === PropertyTypeFilter.ALL ? undefined : params.type;

    const latestProperties = await this.prisma.property.findMany({
      where: {
        NOT: {
          userId,
        },
        type,
      },
      take: 5,
      orderBy: {
        createdAt: 'asc',
      },
    });

    return latestProperties;
  };

  public getUserProperties = async (userId: string) => {
    const properties = await this.prisma.property.findMany({
      where: { userId },
      take: this.PER_PAGE,
      orderBy: {
        createdAt: 'asc',
      },
    });
    return properties;
  };

  public getSearchProperties = async (
    params: PropertySearchParams,
    userId: string,
  ): Promise<InfiniteScrollResponse<Property>> => {
    const take = this.PER_PAGE;
    const { search, cursor, minPrice, maxPrice, persons, startDate, endDate } =
      params;

    const parsedStartDate = startDate ? new Date(startDate) : undefined;
    const parsedEndDate = endDate ? new Date(endDate) : undefined;
    const parsedPersons = persons ? +persons : undefined;
    const parsedMaxPrice = maxPrice ? +maxPrice : undefined;
    const parsedMinPrice = minPrice ? +minPrice : undefined;
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
              userId,
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
    createPropertyDto: CreatePropertyDto & { userId: string },
  ) => {
    const userProperties = await this.getUserProperties(
      createPropertyDto.userId,
    );

    const userPropertyNames = userProperties.map((property) => property.name);
    if (userPropertyNames.includes(createPropertyDto.name)) {
      throw new HttpException(400, 'Property name already exists!');
    }

    return await this.prisma.$transaction(async (tx) => {
      const property = await tx.property.create({
        data: {
          ...createPropertyDto,
          propertyExtras: {
            create: {
              ...createPropertyDto.propertyExtras,
            },
          },
        },
      });
      if (!property) {
        throw new HttpException(500, 'Error while creating property!');
      }

      const updatedUser = await tx.user.update({
        where: { id: createPropertyDto.userId },
        data: {
          role: 'LANDLORD',
        },
      });
      if (!updatedUser) {
        throw new HttpException(
          500,
          `User ${createPropertyDto.userId} has failed to update to landlord!`,
        );
      }

      return property;
    });
  };
}

export default PropertyService;
