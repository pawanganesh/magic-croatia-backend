import express, { NextFunction } from 'express';
import authMiddleware from 'middleware/authMiddleware';
import PropertyService from 'property/property.service';
import PaymentService from 'services/paymentService';
import PrismaService from 'services/prismaService';
import { RequestWithUserId } from 'types/express/custom';
import UserService from 'user/user.service';
import validate from 'validation';
import { createBookingSchema } from 'validation/booking/createBookingSchema';
import { CreateBookingDto } from './booking.interface';
import BookingService from './booking.service';

class BookingController {
  public path = '/bookings';
  public router = express.Router();
  private bookingService = new BookingService(
    PrismaService.getPrisma(),
    new PropertyService(
      PrismaService.getPrisma(),
      new UserService(PrismaService.getPrisma()),
    ),
    new PaymentService(),
  );

  constructor() {
    this.initializeRoutes();
  }

  public initializeRoutes() {
    this.router.get(
      `${this.path}/future/users/me`,
      authMiddleware,
      this.getFutureUserBookings,
    );
    this.router.get(
      `${this.path}/past/users/me`,
      authMiddleware,
      this.getPastUserBookings,
    );
    this.router.get(
      `${this.path}/future/properties/:propertyId`,
      this.getFuturePropertyBookings,
    );
    this.router.post(
      `${this.path}/:id/cancel`,
      authMiddleware,
      this.cancelBoking,
    );
    this.router.post(
      this.path,
      authMiddleware,
      validate(createBookingSchema),
      this.createBooking,
    );
  }

  private getFutureUserBookings = async (
    request: RequestWithUserId,
    response: express.Response,
  ) => {
    const userId: number = +request.userId;
    const userBookings = await this.bookingService.getFutureUserBookings(
      userId,
    );
    return response.json(userBookings);
  };

  private getPastUserBookings = async (
    request: RequestWithUserId,
    response: express.Response,
  ) => {
    const userId: number = +request.userId;
    const userBookings = await this.bookingService.getPastUserBookings(userId);
    return response.json(userBookings);
  };

  private getFuturePropertyBookings = async (
    request: express.Request,
    response: express.Response,
  ) => {
    const propertyId = +request.params.propertyId;
    const futureBookingsForProperty =
      await this.bookingService.getFuturePropertyBookings(propertyId);
    return response.json(futureBookingsForProperty);
  };

  private createBooking = async (
    request: RequestWithUserId,
    response: express.Response,
    next: NextFunction,
  ) => {
    const bookingData: CreateBookingDto = request.body;
    const userId: number = request.userId;
    try {
      const booking = await this.bookingService.createBooking({
        ...bookingData,
        userId,
      });
      return response.json(booking);
    } catch (err) {
      console.log({ err });
      next(err);
    }
  };

  private cancelBoking = async (
    request: RequestWithUserId,
    response: express.Response,
    next: NextFunction,
  ) => {
    const bookingId: number = +request.params.id;
    const userId: number = request.userId;
    try {
      const booking = await this.bookingService.cancelBooking(
        bookingId,
        userId,
      );
      return response.json(booking);
    } catch (err) {
      console.log({ err });
      next(err);
    }
  };
}

export default BookingController;
