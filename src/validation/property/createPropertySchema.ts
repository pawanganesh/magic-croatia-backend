import { body } from 'express-validator';

export const createPropertySchema = [
  body('name').notEmpty().withMessage('Provide name.'),
  body('description').notEmpty().withMessage('Provide description.'),
  body('featuredImageUrl').notEmpty().withMessage('Provide image.'),
  body('address').notEmpty().withMessage('Provide address.'),
  body('gallery')
    .isArray({ min: 1 })
    .withMessage('Minimum one image in gallery is required!'),
  body('pricePerNight').isFloat().withMessage('Provide price per night'),
  body('latitude').isFloat().withMessage('Provide latitude'),
  body('longitude').isFloat().withMessage('Provide longitude'),
  body('persons').isInt().withMessage('No. of persons is required'),
];
