import HttpException from 'exceptions/HttpException';
import Stripe from 'stripe';

class PaymentService {
  private stripe: Stripe;

  constructor() {
    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2022-08-01',
    });
  }

  public createPaymentIntent = async (rawStripePrice: number) => {
    const parsedStripePrice = rawStripePrice * 100;
    const truncatedStripePrice = Math.trunc(parsedStripePrice);

    if (truncatedStripePrice <= 0) {
      throw new HttpException(400, 'Error in costs calculations!');
    }
    try {
      const paymentIntent = await this.stripe.paymentIntents.create({
        amount: truncatedStripePrice,
        currency: 'usd',
      });
      return paymentIntent;
    } catch (err) {
      console.log({ err });
    }
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
