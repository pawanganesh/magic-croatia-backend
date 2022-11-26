import { body } from 'express-validator';

export const createPaymentSchema = [
  body('startDate')
    .notEmpty()
    .isString()
    .withMessage('Provide valid start date.'),
  body('endDate').notEmpty().isString().withMessage('Provide valid end date.'),
  body('adultsCount').isInt().withMessage('Provide valid adults count.'),
  body('childrenCount').isInt().withMessage('Provide valid children count.'),
  body('propertyId').isInt().withMessage('Provide valid property.'),
];
