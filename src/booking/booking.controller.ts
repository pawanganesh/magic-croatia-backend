import { PrismaClient } from '@prisma/client';
import express, { NextFunction } from 'express';
import PropertyService from 'property/property.service';
import UserService from 'user/user.service';
import validate from 'validation';
import { createBookingSchema } from 'validation/booking/createBookingSchema';
import { CreateBookingDto } from './booking.interface';
import BookingService from './booking.service';

class BookingController {
  public path = '/bookings';
  public router = express.Router();
  private bookingService = new BookingService(
    new PrismaClient(),
    new PropertyService(
      new PrismaClient(),
      new UserService(new PrismaClient()),
    ),
  );

  constructor() {
    this.initializeRoutes();
  }

  public initializeRoutes() {
    this.router.get(`${this.path}/users/:userId`, this.getUserBookings);
    this.router.get(
      `${this.path}/future/properties/:propertyId`,
      this.getFuturePropertyBookings,
    );
    this.router.post(
      this.path,
      validate(createBookingSchema),
      this.createBooking,
    );
  }

  private getUserBookings = async (
    request: express.Request,
    response: express.Response,
  ) => {
    const userId: number = +request.params.userId;
    const myBookings = await this.bookingService.getUserBookings(userId);
    return response.json(myBookings);
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
    request: express.Request,
    response: express.Response,
    next: NextFunction,
  ) => {
    const bookingData: CreateBookingDto = request.body;
    try {
      const booking = await this.bookingService.createBooking(bookingData);
      return response.json(booking);
    } catch (err) {
      next(err);
    }
  };
}

export default BookingController;
