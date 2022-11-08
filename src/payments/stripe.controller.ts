import express from "express";
import { StripeBooking } from "./stripe.interface";
import StripeService from "./stripe.service";

class StripeController {
  public path = "/payments";
  public router = express.Router();
  public stripeService = new StripeService();

  constructor() {
    this.initializeRoutes();
  }

  public initializeRoutes() {
    this.router.post(
      `${this.path}/create-payment-intent`,
      this.createPaymentIntent
    );
  }

  private createPaymentIntent = async (
    request: express.Request,
    response: express.Response
  ) => {
    const booking: StripeBooking = request.body.booking;
    const clientSecret = await this.stripeService.createPaymentIntent(booking);
    return response.json(clientSecret);
  };
}

export default StripeController;
