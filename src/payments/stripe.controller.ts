import express from "express";
import UserService from "user/user.service";
import { StripeBooking } from "./stripe.interface";
import StripeService from "./stripe.service";

class StripeController {
  public path = "/payments";
  public router = express.Router();
  public stripeService = new StripeService();
  public userService = new UserService();

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
    const booking: StripeBooking = request.body;
    const user = await this.userService.findUserByUuid(booking.userUuid);
    const clientSecret = await this.stripeService.createPaymentIntent(
      booking,
      user.id
    );
    return response.json(clientSecret);
  };
}

export default StripeController;
