import express, { NextFunction } from 'express';
import authMiddleware from 'middleware/authMiddleware';
import PaymentService from 'services/paymentService';
import { RequestWithUserId } from 'types/express/custom';
import { createPaymentIntentSchema } from 'validation/payment/createPaymentIntentSchema';
import validate from 'validation';

class PaymentController {
  public path = '/payments';
  public router = express.Router();
  public paymentService = new PaymentService();

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
  }

  private createPaymentIntent = async (
    request: RequestWithUserId,
    response: express.Response,
    next: NextFunction,
  ) => {
    try {
      const stripePrice = +request.body.stripePrice;
      const paymentIntent = await this.paymentService.createPaymentIntent(
        stripePrice,
      );
      return response.json(paymentIntent);
    } catch (err) {
      next(err);
    }
  };
}

export default PaymentController;
