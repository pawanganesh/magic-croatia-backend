import { differenceInCalendarDays } from "date-fns";
import HttpException from "exceptions/HttpException";
import PropertyService from "property/property.service";
import Stripe from "stripe";
import { StripeBooking } from "./stripe.interface";

class StripeService {
  private propertyService = new PropertyService();

  public stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: "2022-08-01",
  });

  public createPaymentIntent = async (booking: StripeBooking) => {
    const property = await this.propertyService.getProperty(booking.propertyId);
    if (!property) {
      throw new HttpException(404, "Booked property not found!");
    }
    const stripePrice =
      this.calculateBookingCost(
        booking,
        parseFloat(property.pricePerNight.toString())
      ) * 100;

    if (stripePrice <= 0) {
      throw new HttpException(400, "Error in costs calculations!");
    }

    const paymentIntent = await this.stripe.paymentIntents.create({
      amount: stripePrice,
      currency: "usd",
    });

    const clientSecret = paymentIntent.client_secret;
    return clientSecret;
  };

  private calculateBookingCost = (
    booking: StripeBooking,
    pricePerNight: number
  ) => {
    if (!booking.startDate || !booking.endDate) return 0;

    const totalNights = differenceInCalendarDays(
      booking.endDate,
      booking.startDate
    );

    const totalAdultsPrice = pricePerNight * totalNights * booking.adultsCount;
    const totalChildrenPrice =
      pricePerNight * 0.8 * totalNights * booking.childrenCount;

    const preliminaryCost = totalAdultsPrice + totalChildrenPrice;
    return preliminaryCost;
  };
}

export default StripeService;
