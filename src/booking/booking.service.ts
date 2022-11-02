import { PrismaClient } from "@prisma/client";
import { CreateBookingDto } from "./booking.interface";

class BookingService {
  private prisma = new PrismaClient();

  public getMyBookings = async (userId: number) => {
    const myBookings = await this.prisma.booking.findMany({
      where: { userId },
      select: {
        id: true,
        startDate: true,
        endDate: true,
        totalPrice: true,
        property: true,
        userId: false,
        propertyId: false,
      },
    });

    return myBookings;
  };

  public createBooking = async (bookingData: CreateBookingDto) => {
    const booking = await this.prisma.booking.create({
      data: {
        totalPrice: bookingData.totalPrice,
        startDate: new Date(bookingData.startDate),
        endDate: new Date(bookingData.endDate),
        userId: 1,
        propertyId: bookingData.propertyId,
      },
    });

    return booking;
  };
}

export default BookingService;
