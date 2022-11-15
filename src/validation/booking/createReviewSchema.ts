import { body } from 'express-validator';

export const createReviewSchema = [
  body('review').notEmpty().withMessage('Provide valid review.'),
  body('rating').isFloat({ min: 1, max: 5 }).withMessage('Minimum value is 1, and maximum is 5.'),
];
