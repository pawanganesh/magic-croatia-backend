import express, { NextFunction } from "express";
import PropertyService from "property/property.service";
import validate from "validation";
import { createBookingSchema } from "validation/booking/createBookingSchema";
import { createReviewSchema } from "validation/booking/createReviewSchema";
import { CreateBookingDto, ReviewData } from "./booking.interface";
import BookingService from "./booking.service";

class BookingController {
  public path = "/bookings";
  public router = express.Router();
  public bookingService = new BookingService(new PropertyService());

  constructor() {
    this.initializeRoutes();
  }

  public initializeRoutes() {
    this.router.get(`${this.path}/personal`, this.getMyBookings),
      this.router.get(
        `${this.path}/properties/:propertyId`,
        this.getFutureBookingsForProperty
      );

    this.router.post(
      this.path,
      validate(createBookingSchema),
      this.createBooking
    );

    this.router.post(
      `${this.path}/:id/review`,
      validate(createReviewSchema),
      this.createReview
    );
  }

  private getMyBookings = async (
    request: express.Request,
    response: express.Response
  ) => {
    const myBookings = await this.bookingService.getMyBookings(1);
    return response.json(myBookings);
  };

  private getFutureBookingsForProperty = async (
    request: express.Request,
    response: express.Response
  ) => {
    const propertyId = +request.params.propertyId;

    const futureBookingsForProperty =
      await this.bookingService.getFutureBookingsForProperty(propertyId);

    return response.json(futureBookingsForProperty);
  };

  private createBooking = async (
    request: express.Request,
    response: express.Response
  ) => {
    const bookingData: CreateBookingDto = request.body;
    const booking = await this.bookingService.createBooking(bookingData);
    return response.json(booking);
  };

  private createReview = async (
    request: express.Request,
    response: express.Response,
    next: NextFunction
  ) => {
    const reviewData: ReviewData = request.body;
    const bookingId = +request.params.id;
    const userId = 4;
    try {
      await this.bookingService.validateBookingReview(bookingId, userId);

      const updatedBooking = await this.bookingService.createBookingReview(
        bookingId,
        reviewData
      );
      return response.json(updatedBooking);
    } catch (err) {
      next(err);
    }
  };
}

export default BookingController;
