import Stripe from 'stripe';

class PaymentService {
  private stripe: Stripe;

  constructor() {
    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2022-08-01',
    });
  }

  public createPaymentIntent = async (stripePrice: number) => {
    const paymentIntent = await this.stripe.paymentIntents.create({
      amount: stripePrice,
      currency: 'usd',
    });
    return paymentIntent;
  };

  public createRefund = async (paymentIntent: string, stripeAmount: number) => {
    const refund = await this.stripe.refunds.create({
      payment_intent: paymentIntent,
      amount: stripeAmount,
    });
    return refund;
  };
}

export default PaymentService;
