import express from "express";
import validate from "validation";
import { createBookingSchema } from "validation/booking/createBookingSchema";
import { CreateBookingDto } from "./booking.interface";
import BookingService from "./booking.service";

class BookingController {
  public path = "/bookings";
  public router = express.Router();
  public bookingService = new BookingService();

  constructor() {
    this.initializeRoutes();
  }

  public initializeRoutes() {
    this.router.get(`${this.path}/personal`, this.getMyBookings),
      this.router.post(
        this.path,
        validate(createBookingSchema),
        this.createBooking
      );
  }

  private getMyBookings = async (
    request: express.Request,
    response: express.Response
  ) => {
    const myBookings = await this.bookingService.getMyBookings(1);

    return response.json(myBookings);
  };

  private createBooking = async (
    request: express.Request,
    response: express.Response
  ) => {
    const bookingData: CreateBookingDto = request.body;
    const booking = await this.bookingService.createBooking(bookingData);

    return response.json(booking);
  };
}

export default BookingController;
