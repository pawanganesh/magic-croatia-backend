import HttpException from 'exceptions/HttpException';
import PropertyService from 'property/property.service';
import BookingService from 'booking/booking.service';
import Stripe from 'stripe';
import { StripeBooking } from './stripe.interface';
import { calculateBookingCost } from 'booking/utils';
import { PrismaClient } from '@prisma/client';

class StripeService {
  private propertyService = new PropertyService();
  private bookingService = new BookingService(this.propertyService, new PrismaClient());

  public stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2022-08-01',
  });

  public createPaymentIntent = async (booking: StripeBooking, userId: number) => {
    const property = await this.propertyService.getProperty(booking.propertyId);
    const bookingStartDate = new Date(booking.startDate);
    const bookingEndDate = new Date(booking.endDate);

    const preliminaryCost = calculateBookingCost({
      ...booking,
      startDate: bookingStartDate,
      endDate: bookingEndDate,
      pricePerNight: property.pricePerNight,
    });

    const stripePrice = parseFloat(preliminaryCost.toString()) * 100;
    if (stripePrice <= 0) {
      throw new HttpException(400, 'Error in costs calculations!');
    }

    const paymentIntent = await this.stripe.paymentIntents.create({
      amount: stripePrice,
      currency: 'usd',
    });

    const clientSecret = paymentIntent.client_secret;
    if (clientSecret) {
      await this.bookingService.createBooking({
        totalPrice: preliminaryCost,
        startDate: new Date(booking.startDate),
        endDate: new Date(booking.endDate),
        propertyId: booking.propertyId,
        userId,
        adultsCount: booking.adultsCount,
        childrenCount: booking.childrenCount,
      });
    }

    return clientSecret;
  };
}

export default StripeService;
