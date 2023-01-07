import { body } from 'express-validator';

export const createBookingSchema = [
  body('totalPrice').isDecimal(),
  body('startDate')
    .notEmpty()
    .isString()
    .withMessage('Provide valid start date'),
  body('endDate').notEmpty().isString().withMessage('Provide valid end date'),
  body('adultsCount').isInt(),
  body('childrenCount').isInt(),
  body('propertyId').isInt(),
  body('paymentIntentId')
    .notEmpty()
    .isString()
    .withMessage('Provide valid payment intent id'),
];
