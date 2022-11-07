import PropertyService from "property/property.service";
import Stripe from "stripe";

class StripeService {
  private propertyService = new PropertyService();

  public stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: "2022-08-01",
  });

  public createPaymentIntent = async (propertyId: number) => {
    // TODO add booking date range to calc price
    const property = await this.propertyService.getProperty(propertyId);

    const stripePrice = parseFloat(property.pricePerNight.toString()) * 100;
    const paymentIntent = await this.stripe.paymentIntents.create({
      amount: stripePrice,
      currency: "usd",
    });

    const clientSecret = paymentIntent.client_secret;
    return clientSecret;
  };
}

export default StripeService;
