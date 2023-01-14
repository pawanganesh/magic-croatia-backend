import express, { NextFunction } from 'express';
import authMiddleware from 'middleware/authMiddleware';
import { RequestWithUserId } from 'types/express/custom';
import { createPaymentIntentSchema } from 'validation/payment/createPaymentIntentSchema';
import validate from 'validation';
import { createPaymentRefundSchema } from 'validation/payment/createPaymentRefundSchema';
import PrismaService from 'services/prismaService';
import PaymentService from './payment.service';

class PaymentController {
  public path = '/payments';
  public router = express.Router();
  public paymentService = new PaymentService(PrismaService.getPrisma());

  constructor() {
    this.initializeRoutes();
  }

  public initializeRoutes() {
    this.router.post(
      `${this.path}/create-payment-intent`,
      authMiddleware,
      validate(createPaymentIntentSchema),
      this.createPaymentIntent,
    );
    this.router.post(
      `${this.path}/create-booking-refund`,
      authMiddleware,
      validate(createPaymentRefundSchema),
      this.createBookingRefund,
    );
  }

  private createPaymentIntent = async (
    request: RequestWithUserId,
    response: express.Response,
    next: NextFunction,
  ) => {
    try {
      const rawStripePrice = +request.body.stripePrice;
      const paymentIntent = await this.paymentService.createPaymentIntent(
        rawStripePrice,
      );
      return response.json(paymentIntent);
    } catch (err) {
      console.log({ err });
      next(err);
    }
  };

  private createBookingRefund = async (
    request: RequestWithUserId,
    response: express.Response,
    next: NextFunction,
  ) => {
    try {
      const userId: string = request.userId;
      const bookingId = +request.body.bookingId;
      const refund = await this.paymentService.createBookingRefund({
        bookingId,
        userId,
      });
      return response.json(refund);
    } catch (err) {
      console.log({ err });
      next(err);
    }
  };
}

export default PaymentController;
