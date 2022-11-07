import express from "express";
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
    const propertyId = +request.body.propertyId;
    const clientSecret = await this.stripeService.createPaymentIntent(
      propertyId
    );
    return response.json(clientSecret);
  };
}

export default StripeController;
