import { PrismaClient, Status } from '@prisma/client';
import {
  CancelBooking,
  CreateBookingDto,
  FutureBookingsForProperty,
  PropertyBookingReport,
  UserBooking,
} from './booking.interface';
import HttpException from 'exceptions/HttpException';
import { isAfter, isBefore, isEqual } from 'date-fns';
import {
  calculateBookingCost,
  checkBookedInterval,
  getBookedDays,
  getBookingDistance,
} from './utils';
import MailService from 'services/mailService';

class BookingService {
  private prisma: PrismaClient;
  private mailService: MailService;

  constructor(prisma: PrismaClient, mailService: MailService) {
    this.prisma = prisma;
    this.mailService = mailService;
  }

  public getFutureUserBookings = async (
    userId: string,
  ): Promise<UserBooking[]> => {
    const userBookings = await this.prisma.booking.findMany({
      where: {
        userId,
        startDate: { gte: new Date() },
      },
      select: {
        id: true,
        startDate: true,
        endDate: true,
        totalPrice: true,
        property: true,
        adultsCount: true,
        childrenCount: true,
        status: true,
      },
      orderBy: {
        startDate: 'asc',
      },
    });
    return userBookings;
  };

  public getPastUserBookings = async (
    userId: string,
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
        status: true,
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
        status: 'ACTIVE',
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
    bookingData: CreateBookingDto & { userId: string },
  ) => {
    const {
      totalPrice,
      adultsCount,
      childrenCount,
      startDate,
      endDate,
      propertyId,
      userId,
      paymentIntentId,
    } = bookingData;

    const bookingStartDate = new Date(startDate);
    const bookingEndDate = new Date(endDate);

    await this.isPropertyAvailable(
      propertyId,
      bookingStartDate,
      bookingEndDate,
    );

    const property = await this.prisma.property.findFirst({
      where: { id: propertyId },
    });
    if (!property) {
      throw new HttpException(
        404,
        `Property with id: #${propertyId} not found!`,
      );
    }

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

    const createdBooking = await this.prisma.booking.create({
      data: {
        totalPrice: bookingCost,
        startDate: bookingStartDate,
        endDate: bookingEndDate,
        userId,
        propertyId,
        adultsCount,
        childrenCount,
        stripePaymentIntent: paymentIntentId,
      },
    });

    if (!createdBooking) {
      throw new HttpException(
        500,
        `Error while creating booking with payment intent id: ${paymentIntentId}!`,
      );
    }

    // await this.mailService.sendEmail({
    //   subject: 'Booking created!',
    //   html: `<div>Property ${property.name}</div><div>Booked from ${startDate} to ${endDate}. Total price is $${totalPrice}.</div>`,
    // });

    return createdBooking;
  };

  private isPropertyAvailable = async (
    propertyId: number,
    bookingStartDate: Date,
    bookingEndDate: Date,
  ) => {
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
  };

  public cancelBooking = async ({ bookingId, userId }: CancelBooking) => {
    const foundBooking = await this.prisma.booking.findFirstOrThrow({
      where: {
        id: bookingId,
        userId,
      },
      select: {
        id: true,
        status: true,
        startDate: true,
        property: {
          select: {
            checkIn: true,
          },
        },
      },
    });
    if (foundBooking.status === Status.CANCELED) {
      throw new HttpException(
        400,
        `Booking #${foundBooking.id} is already cancelled!`,
      );
    }
    if (
      isAfter(new Date(), new Date(foundBooking.startDate)) ||
      isEqual(new Date(foundBooking.startDate), new Date())
    ) {
      const bookingDistance = getBookingDistance(
        foundBooking.startDate,
        foundBooking.property.checkIn,
      );
      throw new HttpException(
        400,
        `Booking cancelation time has passed ${bookingDistance}!`,
      );
    }

    const updatedBooking = await this.prisma.booking.update({
      where: { id: foundBooking.id },
      data: {
        status: Status.CANCELED,
      },
    });
    if (!updatedBooking) {
      throw new HttpException(
        400,
        `Error while updating booking #${foundBooking.id} status`,
      );
    }

    return updatedBooking;
  };

  public getPropertyBookingReport = async (
    propertyId: number,
  ): Promise<PropertyBookingReport> => {
    const [
      totalRevenue,
      totalYearRevenue,
      totalYearBookings,
      totalYearBookedDays,
    ] = await Promise.all([
      this.calculatePropertyTotalRevenue(propertyId),
      this.calculatePropertyYearRevenue(propertyId),
      this.calculateTotalPropertyYearBookings(propertyId),
      this.calculateTotalPropertyYearBookedDays(propertyId),
    ]);
    return {
      totalRevenue: parseFloat(totalRevenue._sum.totalPrice?.toString()),
      totalYearRevenue: parseFloat(
        totalYearRevenue._sum.totalPrice?.toString(),
      ),
      totalYearBookings: totalYearBookings._count,
      totalYearBookedDays,
    };
  };

  private calculatePropertyTotalRevenue = async (propertyId: number) => {
    const totalRevenue = await this.prisma.booking.aggregate({
      where: {
        propertyId,
        status: 'ACTIVE',
      },
      _sum: {
        totalPrice: true,
      },
    });
    return totalRevenue;
  };

  private calculatePropertyYearRevenue = async (propertyId: number) => {
    const today = new Date();
    const totalRevenue = await this.prisma.booking.aggregate({
      where: {
        propertyId,
        status: 'ACTIVE',
        endDate: { lte: new Date(today.getFullYear(), 12, 31, 23, 59) },
      },
      _sum: {
        totalPrice: true,
      },
    });
    return totalRevenue;
  };

  private calculateTotalPropertyYearBookings = async (propertyId: number) => {
    const today = new Date();
    const totalBookings = await this.prisma.booking.aggregate({
      where: {
        propertyId,
        status: 'ACTIVE',
        endDate: { lte: new Date(today.getFullYear(), 12, 31, 23, 59) },
      },
      _count: true,
    });
    return totalBookings;
  };

  private calculateTotalPropertyYearBookedDays = async (propertyId: number) => {
    const today = new Date();
    const bookings = await this.prisma.booking.findMany({
      where: {
        propertyId,
        status: 'ACTIVE',
        endDate: { lte: new Date(today.getFullYear(), 12, 31, 23, 59) },
      },
    });
    const totalBookedDays = getBookedDays(bookings).length;
    return totalBookedDays;
  };
}

export default BookingService;
