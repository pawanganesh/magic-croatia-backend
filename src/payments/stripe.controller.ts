import express from 'express';
import authMiddleware from 'middleware/authMiddleware';
import { RequestWithUserId } from 'types/express/custom';
import validate from 'validation';
import { createPaymentSchema } from 'validation/payment/createPaymentSchema';
import { StripeBooking } from './stripe.interface';
import StripeService from './stripe.service';

class StripeController {
  public path = '/payments';
  public router = express.Router();
  public stripeService = new StripeService();

  constructor() {
    this.initializeRoutes();
  }

  public initializeRoutes() {
    this.router.post(
      `${this.path}/create-payment-intent`,
      authMiddleware,
      validate(createPaymentSchema),
      this.createPaymentIntent,
    );
  }

  private createPaymentIntent = async (
    request: RequestWithUserId,
    response: express.Response,
    next: express.NextFunction,
  ) => {
    try {
      const booking: StripeBooking = request.body;
      const userId = +request.userId;
      const clientSecret = await this.stripeService.createPaymentIntent(
        booking,
        userId,
      );
      return response.json(clientSecret);
    } catch (err) {
      next(err);
    }
  };
}

export default StripeController;
