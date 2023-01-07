import { body } from 'express-validator';

export const createPaymentIntentSchema = [
  body('stripePrice').isInt().withMessage('Invalid stripe price!'),
];
