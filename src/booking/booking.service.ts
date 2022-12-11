import { PrismaClient } from '@prisma/client';
import {
  CreateBookingDto,
  FutureBookingsForProperty,
  UserBooking,
} from './booking.interface';
import HttpException from 'exceptions/HttpException';
import PropertyService from 'property/property.service';
import { isBefore, isEqual } from 'date-fns';
import {
  calculateBookingCost,
  checkBookedInterval,
  getBookedDays,
} from './utils';
import PaymentService from 'services/paymentService';

class BookingService {
  private prisma: PrismaClient;
  private propertyService: PropertyService;
  private paymentService: PaymentService;

  constructor(
    prisma: PrismaClient,
    propertyService: PropertyService,
    paymentService: PaymentService,
  ) {
    this.prisma = prisma;
    this.propertyService = propertyService;
    this.paymentService = paymentService;
  }

  public getFutureUserBookings = async (
    userId: number,
  ): Promise<UserBooking[]> => {
    const userBookings = await this.prisma.booking.findMany({
      where: { userId, startDate: { gte: new Date() } },
      select: {
        id: true,
        startDate: true,
        endDate: true,
        totalPrice: true,
        property: true,
        adultsCount: true,
        childrenCount: true,
      },
      orderBy: {
        startDate: 'asc',
      },
    });
    return userBookings;
  };

  public getPastUserBookings = async (
    userId: number,
  ): Promise<UserBooking[]> => {
    const userBookings = await this.prisma.booking.findMany({
      where: { userId, endDate: { lt: new Date() } },
      select: {
        id: true,
        startDate: true,
        endDate: true,
        totalPrice: true,
        property: true,
        adultsCount: true,
        childrenCount: true,
      },
      orderBy: {
        endDate: 'desc',
      },
    });
    return userBookings;
  };

  public getFuturePropertyBookings = async (
    propertyId: number,
  ): Promise<FutureBookingsForProperty[]> => {
    const futurePropertyBookings = await this.prisma.booking.findMany({
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

    return futurePropertyBookings;
  };

  public createBooking = async (
    bookingData: CreateBookingDto & { userId: number },
  ) => {
    const {
      totalPrice,
      adultsCount,
      childrenCount,
      startDate,
      endDate,
      propertyId,
      userId,
    } = bookingData;

    const bookingStartDate = new Date(startDate);
    const bookingEndDate = new Date(endDate);

    if (
      isBefore(bookingStartDate, new Date()) ||
      isEqual(bookingStartDate, new Date())
    ) {
      throw new HttpException(400, 'Invalid start date!');
    }
    if (
      isBefore(bookingEndDate, bookingStartDate) ||
      isEqual(bookingEndDate, bookingStartDate)
    ) {
      throw new HttpException(400, 'Invalid end date!');
    }

    const propertyFutureBookings = await this.getFuturePropertyBookings(
      propertyId,
    );
    const bookedDays = getBookedDays(propertyFutureBookings);
    const isBookingValid = checkBookedInterval(
      bookingStartDate,
      bookingEndDate,
      bookedDays,
    );
    if (!isBookingValid) {
      throw new HttpException(
        400,
        'Chosen dates for this property are not available!',
      );
    }

    const property = await this.propertyService.getProperty(propertyId);

    const totalPersonsForBooking = adultsCount + childrenCount;
    if (totalPersonsForBooking !== property.persons) {
      throw new HttpException(
        400,
        `Required number of people for this property is ${property.persons}`,
      );
    }

    const bookingCost = calculateBookingCost({
      startDate: bookingStartDate,
      endDate: bookingEndDate,
      adultsCount,
      childrenCount,
      pricePerNight: property.pricePerNight,
    });

    if (Number(bookingCost) !== Number(totalPrice)) {
      throw new HttpException(400, `Calculated price is not the same!`);
    }

    const stripePrice =
      parseFloat(parseFloat(bookingCost.toString()).toFixed(2)) * 100;
    if (stripePrice <= 0) {
      throw new HttpException(400, 'Error in costs calculations!');
    }

    const paymentIntent = await this.paymentService.createPaymentIntent(
      stripePrice,
    );

    await this.prisma.booking.create({
      data: {
        totalPrice: bookingCost,
        startDate: bookingStartDate,
        endDate: bookingEndDate,
        userId,
        propertyId,
        adultsCount,
        childrenCount,
        stripePaymentIntent: paymentIntent.id,
      },
    });
    const clientSecret = paymentIntent.client_secret;
    return clientSecret;
  };
}

export default BookingService;
