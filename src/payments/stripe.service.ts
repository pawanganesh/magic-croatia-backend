import { differenceInCalendarDays } from "date-fns";
import HttpException from "exceptions/HttpException";
import PropertyService from "property/property.service";
import BookingService from "booking/booking.service";
import Stripe from "stripe";
import { StripeBooking } from "./stripe.interface";
import { Prisma } from "@prisma/client";

class StripeService {
  private propertyService = new PropertyService();
  private bookingService = new BookingService(this.propertyService);

  public stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: "2022-08-01",
  });

  public createPaymentIntent = async (booking: StripeBooking) => {
    const property = await this.propertyService.getProperty(booking.propertyId);
    if (!property) {
      throw new HttpException(404, "Booked property not found!");
    }

    const preliminaryCost = this.calculateBookingCost(
      booking,
      parseFloat(property.pricePerNight.toString())
    );

    const stripePrice = parseFloat(preliminaryCost.toFixed(2)) * 100;

    if (stripePrice <= 0) {
      throw new HttpException(400, "Error in costs calculations!");
    }

    const paymentIntent = await this.stripe.paymentIntents.create({
      amount: stripePrice,
      currency: "usd",
    });

    const clientSecret = paymentIntent.client_secret;
    if (clientSecret) {
      await this.bookingService.createBooking({
        totalPrice: preliminaryCost,
        startDate: new Date(booking.startDate),
        endDate: new Date(booking.endDate),
        propertyId: booking.propertyId,
      });
    }

    return clientSecret;
  };

  private calculateBookingCost = (
    booking: StripeBooking,
    pricePerNight: number
  ): Prisma.Decimal => {
    if (!booking.startDate || !booking.endDate) return new Prisma.Decimal(0.0);

    const totalNights = differenceInCalendarDays(
      new Date(booking.endDate),
      new Date(booking.startDate)
    );

    const totalAdultsPrice = pricePerNight * totalNights * booking.adultsCount;
    const totalChildrenPrice =
      pricePerNight * 0.8 * totalNights * booking.childrenCount;

    const preliminaryCost = parseFloat(
      (totalAdultsPrice + totalChildrenPrice).toString()
    ).toFixed(2);
    return new Prisma.Decimal(preliminaryCost);
  };
}

export default StripeService;
