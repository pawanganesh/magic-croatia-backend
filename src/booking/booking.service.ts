import { PrismaClient, Status } from "@prisma/client";
import {
  CreateBookingDto,
  FutureBookingsForProperty,
  MyBooking,
  ReviewData,
} from "./booking.interface";
import HttpException from "exceptions/HttpException";
import PropertyService from "property/property.service";
import { isBefore } from "date-fns";
import {
  calculateBookingCost,
  checkBookedInterval,
  getBookedDays,
} from "./utils";

class BookingService {
  private prisma = new PrismaClient();
  private propertyService: PropertyService;

  constructor(propertyService: PropertyService) {
    this.propertyService = propertyService;
  }

  public getMyBookings = async (userId: number): Promise<MyBooking[]> => {
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

  public getFutureBookingsForProperty = async (
    propertyId: number
  ): Promise<FutureBookingsForProperty[]> => {
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
    const {
      totalPrice,
      adultCount,
      childrenCount,
      startDate,
      endDate,
      propertyId,
      userId,
    } = bookingData;

    const CURRENT_MONTH = new Date(
      new Date().getFullYear(),
      new Date().getMonth(),
      1
    );
    if (isBefore(startDate, CURRENT_MONTH)) {
      throw new HttpException(400, "Invalid start date!");
    }
    if (isBefore(endDate, startDate)) {
      throw new HttpException(400, "Invalid end date!");
    }

    const propertyFutureBookings = await this.getFutureBookingsForProperty(
      propertyId
    );
    const bookedDays = getBookedDays(propertyFutureBookings);
    const isBookingValid = checkBookedInterval(startDate, endDate, bookedDays);
    if (!isBookingValid) {
      throw new HttpException(
        400,
        "Chosen dates for this property are not available!"
      );
    }

    const property = await this.propertyService.getProperty(propertyId);

    const totalPersonsForBooking = adultCount + childrenCount;
    if (totalPersonsForBooking > property.persons) {
      throw new HttpException(
        400,
        `Maximum number of people for this property is ${property.persons}`
      );
    }

    const bookingCost = calculateBookingCost({
      startDate,
      endDate,
      adultCount,
      childrenCount,
      pricePerNight: property.pricePerNight,
    });
    if (bookingCost !== parseFloat(property.pricePerNight.toPrecision(2))) {
      throw new HttpException(400, `Calculated price is not the same!`);
    }

    const booking = await this.prisma.booking.create({
      data: {
        totalPrice,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        userId,
        propertyId,
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
