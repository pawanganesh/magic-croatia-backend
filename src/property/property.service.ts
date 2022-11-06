import { PrismaClient, Role, Status } from "@prisma/client";
import HttpException from "exceptions/HttpException";
import { CreatePropertyDto } from "./property.interface";

class PropertyService {
  private prisma = new PrismaClient();

  public getMyProperties = async (userId: number) => {
    const properties = await this.prisma.property.findMany({
      where: { userId },
      include: {
        bookings: {
          select: {
            rating: true,
            review: true,
          },
          take: 5,
        },
      },
      take: 10,
    });
    return properties;
  };

  public createProperty = async (
    propertyData: CreatePropertyDto,
    userId: number
  ) => {
    const property = await this.prisma.property.create({
      data: {
        ...propertyData,
        userId,
      },
    });
    return property;
  };

  public canCreateProperty = async (userId) => {
    const user = await this.prisma.user.findFirst({
      where: { id: userId },
    });
    if (user.role !== Role.LANDLORD) {
      throw new HttpException(400, "You are not landlord!");
    }
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
      0
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
