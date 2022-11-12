import { PrismaClient, Status } from "@prisma/client";
import { CreateBookingDto, ReviewData } from "./booking.interface";
import HttpException from "exceptions/HttpException";
import PropertyService from "property/property.service";
import { isBefore } from "date-fns";

class BookingService {
  private prisma = new PrismaClient();
  private propertyService: PropertyService;

  constructor(propertyService: PropertyService) {
    this.propertyService = propertyService;
  }

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

  public getFutureBookingsForProperty = async (propertyId: number) => {
    const futureBookings = await this.prisma.booking.findMany({
      where: {
        propertyId,
        startDate: {
          gte: new Date(),
        },
      },
      select: {
        id: true,
        startDate: true,
        endDate: true,
      },
    });

    return futureBookings;
  };

  public createBooking = async (bookingData: CreateBookingDto) => {
    const CURRENT_MONTH = new Date(
      new Date().getFullYear(),
      new Date().getMonth(),
      1
    );

    if (isBefore(bookingData.startDate, CURRENT_MONTH)) {
      throw new HttpException(400, "Invalid start date!");
    }
    if (isBefore(bookingData.endDate, bookingData.startDate)) {
      throw new HttpException(400, "Invalid end date!");
    }

    const booking = await this.prisma.booking.create({
      data: {
        totalPrice: bookingData.totalPrice,
        startDate: new Date(bookingData.startDate),
        endDate: new Date(bookingData.endDate),
        userId: bookingData.userId,
        propertyId: bookingData.propertyId,
      },
    });
    return booking;
  };

  public createBookingReview = async (
    bookingId: number,
    reviewData: ReviewData
  ) => {
    const updatedBooking = await this.prisma.booking.update({
      where: { id: bookingId },
      data: {
        review: reviewData.review,
        rating: reviewData.rating,
      },
    });
    await this.propertyService.calculatePropertyAverageRating(
      updatedBooking.propertyId
    );
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
