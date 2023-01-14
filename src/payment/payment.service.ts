import { PrismaClient } from '@prisma/client';
import HttpException from 'exceptions/HttpException';
import { calculateBookingRefund, getStripePrice } from 'payment/payment.utils';
import Stripe from 'stripe';
import { CreateBookingRefund } from './payment.interface';

class PaymentService {
  private stripe: Stripe;
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2022-08-01',
    });
    this.prisma = prisma;
  }

  public createPaymentIntent = async (rawStripePrice: number) => {
    const stripePrice = getStripePrice(rawStripePrice);
    if (stripePrice <= 0) {
      throw new HttpException(400, 'Error in parsing stripe price!');
    }
    const paymentIntent = await this.stripe.paymentIntents.create({
      amount: stripePrice,
      currency: 'usd',
    });
    return paymentIntent;
  };

  public createBookingRefund = async ({
    bookingId,
    userId,
  }: CreateBookingRefund) => {
    const foundBooking = await this.findBookingForRefund(bookingId, userId);
    if (!foundBooking) {
      throw new HttpException(404, `Booking with id #${bookingId} not found!`);
    }

    const amountToRefund = calculateBookingRefund(
      foundBooking.startDate,
      parseFloat(foundBooking.totalPrice.toString()),
    );
    if (amountToRefund >= parseFloat(foundBooking.totalPrice.toString())) {
      throw new HttpException(400, 'Error while calculating refund amount!');
    }

    const refund = await this.createPaymentRefund(
      foundBooking.stripePaymentIntent,
      amountToRefund,
    );
    if (!refund) {
      throw new HttpException(500, 'Error while creating refund!');
    }

    const updatedBooking = await this.updateBookingWithRefundId(
      bookingId,
      refund,
    );
    if (!updatedBooking) {
      console.log({
        error: `Error while updating booking #${bookingId} with refund!`,
      });
    }

    return refund;
  };

  private updateBookingWithRefundId = async (
    bookingId: number,
    refund: Stripe.Refund,
  ) => {
    const updatedBooking = await this.prisma.booking.update({
      where: {
        id: bookingId,
      },
      data: {
        stripeRefundId: refund.id,
      },
    });
    return updatedBooking;
  };

  private findBookingForRefund = async (bookingId: number, userId: string) => {
    const foundBooking = await this.prisma.booking.findFirst({
      where: {
        id: bookingId,
        userId,
      },
      select: {
        id: true,
        startDate: true,
        totalPrice: true,
        stripePaymentIntent: true,
      },
    });
    return foundBooking;
  };

  private createPaymentRefund = async (
    paymentIntentId: string,
    rawStripePrice: number,
  ) => {
    const stripePrice = getStripePrice(rawStripePrice);
    if (stripePrice <= 0) {
      throw new HttpException(400, 'Error in parsing stripe price!');
    }
    const refund = await this.stripe.refunds.create({
      payment_intent: paymentIntentId,
      amount: stripePrice,
    });
    return refund;
  };
}

export default PaymentService;
