import Stripe from "stripe";

class StripeService {
  public stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: "2022-08-01",
  });

  public createStripeProduct = async (
    propertyName: string,
    propertyId: number
  ) => {
    const product = await this.stripe.products.create({
      name: propertyName,
      id: propertyId.toString(),
    });
    return product;
  };

  public createStripePrice = async (
    productId: string,
    priceInCents: number
  ) => {
    const price = await this.stripe.prices.create({
      product: productId,
      unit_amount: priceInCents,
      currency: "usd",
    });
    return price;
  };

  public createStripeSession = async (path: string) => {
    const session = await this.stripe.checkout.sessions.create({
      line_items: [
        {
          price: "price_1LzyAuKFqGXoqmW7pT7ZRgJe",
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${process.env.BACKEND_DOMAIN}${path}?success=true`,
      cancel_url: `${process.env.BACKEND_DOMAIN}${path}?canceled=true`,
    });
    return session;
  };
}

export default StripeService;
