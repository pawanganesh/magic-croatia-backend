import { PrismaClient, Role } from '@prisma/client';
import HttpException from 'exceptions/HttpException';
import { CreatePropertyDto, PropertyWithBookings } from './property.interface';

class PropertyService {
  private prisma = new PrismaClient();

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
      take: 10,
    });
    return properties;
  };

  public createProperty = async (propertyData: CreatePropertyDto) => {
    // TODO cannot have the same name if user is the same check
    const property = await this.prisma.property.create({
      data: {
        ...propertyData,
      },
    });

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

    await this.prisma.property.update({
      where: { id: propertyId },
      data: {
        averageRating: totalRating / propertyBookings.bookings.length,
        numberOfReviews: propertyBookings.bookings.length,
      },
    });
  };
}

export default PropertyService;
