import { body } from 'express-validator';

export const createPaymentIntentSchema = [
  body('stripePrice').isDecimal().withMessage('Invalid stripe price!'),
];
