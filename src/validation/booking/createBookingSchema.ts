import { body } from 'express-validator';

export const createBookingSchema = [
  body('totalPrice').isDecimal(),
  body('startDate').isDate().withMessage('Provide valid start date'),
  body('endDate').isDate().withMessage('Provide valid end date'),
  body('adultsCount').isInt(),
  body('childrenCount').isInt(),
  body('propertyId').isInt(),
];
