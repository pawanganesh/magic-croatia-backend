import { PrismaClient, Status } from "@prisma/client";
import { CreateBookingDto, ReviewData } from "./booking.interface";
import HttpException from "exceptions/HttpException";
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
        userId: 3,
        propertyId: bookingData.propertyId,
      },
    });
    return booking;
  };

  public createBookingReview = async (
    bookingId: number,
    userId: number,
    reviewData: ReviewData
  ) => {
    const updatedBooking = await this.prisma.booking.update({
      where: { id: bookingId },
      data: {
        review: reviewData.review,
        rating: reviewData.rating,
      },
    });
    return updatedBooking;
  };

  public validateBookingReview = async (bookingId: number, userId: number) => {
    const affectedBooking = await this.prisma.booking.findFirst({
      where: { id: bookingId },
    });
    if (affectedBooking.userId !== userId) {
      throw new HttpException(400, "This booking is not yours!");
    }
    if (affectedBooking.status !== Status.FINISHED) {
      throw new HttpException(400, "Booking is not finished yet!");
    }
    if (affectedBooking.rating && affectedBooking.review) {
      throw new HttpException(400, "Booking already has your review!");
    }
  };
}

export default BookingService;
