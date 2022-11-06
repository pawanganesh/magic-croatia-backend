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
      `${this.path}/create-checkout-session`,
      this.createCheckoutSession
    );
  }

  private createCheckoutSession = async (
    request: express.Request,
    response: express.Response
  ) => {
    const propertyId: number = request.body.propertyId;
    const session = await this.stripeService.createStripeSession(
      propertyId,
      this.path
    );
    return response.redirect(303, session.url);
  };
}

export default StripeController;
