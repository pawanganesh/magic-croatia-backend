import { PrismaClient } from '@prisma/client';
import express, { NextFunction } from 'express';
import authMiddleware from 'middleware/authMiddleware';
import PropertyService from 'property/property.service';
import { RequestWithUserUid } from 'types/express/custom';
import UserService from 'user/user.service';
import validate from 'validation';
import { createBookingSchema } from 'validation/booking/createBookingSchema';
import { createReviewSchema } from 'validation/booking/createReviewSchema';
import { CreateBookingDto, ReviewData } from './booking.interface';
import BookingService from './booking.service';

class BookingController {
  public path = '/bookings';
  public router = express.Router();
  private bookingService = new BookingService(
    new PropertyService(new UserService(), new PrismaClient()),
    new UserService(),
    new PrismaClient(),
  );

  constructor() {
    this.initializeRoutes();
  }

  public initializeRoutes() {
    this.router.get(`${this.path}/personal/:userId`, this.getMyBookings);
    this.router.get(
      `${this.path}/properties/:propertyId`,
      this.getFutureBookingsForProperty,
    );
    this.router.post(
      this.path,
      validate(createBookingSchema),
      this.createBooking,
    );
    this.router.get(
      `${this.path}/:propertyId/reviews`,
      this.getReviewsForProperty,
    );
    this.router.post(
      `${this.path}/:id/review`,
      validate(createReviewSchema),
      authMiddleware,
      this.createReview,
    );
  }

  private getMyBookings = async (
    request: express.Request,
    response: express.Response,
  ) => {
    const userId: number = +request.params.userId;
    const myBookings = await this.bookingService.getMyBookings(userId);
    return response.json(myBookings);
  };

  private getReviewsForProperty = async (
    request: express.Request,
    response: express.Response,
  ) => {
    const propertyId: number = +request.params.propertyId;
    const propertyReviews = await this.bookingService.getReviewsForProperty(
      propertyId,
    );
    return response.json(propertyReviews);
  };

  private getFutureBookingsForProperty = async (
    request: express.Request,
    response: express.Response,
  ) => {
    const propertyId = +request.params.propertyId;
    const futureBookingsForProperty =
      await this.bookingService.getFutureBookingsForProperty(propertyId);
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

  private createReview = async (
    request: RequestWithUserUid,
    response: express.Response,
    next: NextFunction,
  ) => {
    const reviewData: ReviewData = request.body;
    const bookingId = +request.params.id;
    try {
      await this.bookingService.validateBookingReview(
        bookingId,
        request.userUid,
      );
      const updatedBooking = await this.bookingService.createBookingReview(
        bookingId,
        reviewData,
      );
      return response.json(updatedBooking);
    } catch (err) {
      next(err);
    }
  };
}

export default BookingController;
