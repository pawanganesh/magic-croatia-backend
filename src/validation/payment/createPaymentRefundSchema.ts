import { body } from 'express-validator';

export const createPaymentRefundSchema = [body('bookingId').isInt()];
