import express from "express";
import Stripe from "stripe";

class StripeController {
  public path = "/payments";
  public router = express.Router();
  public stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: "2022-08-01",
  });

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
    console.log({ request });

    const session = await this.stripe.checkout.sessions.create({
      line_items: [
        {
          price: "price_1LzyAuKFqGXoqmW7pT7ZRgJe",
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${process.env.BACKEND_DOMAIN}${this.path}?success=true`,
      cancel_url: `${process.env.BACKEND_DOMAIN}${this.path}?canceled=true`,
    });

    return response.redirect(303, session.url);
  };
}

export default StripeController;
