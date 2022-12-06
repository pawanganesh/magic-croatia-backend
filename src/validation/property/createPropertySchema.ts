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
  body('maxChildrenCount').isInt().withMessage('No. of children is required'),
  body('bedroomCount').isInt().withMessage('No. of bedrooms is required'),
  body('size').isFloat().withMessage('Property size is required'),
  body('checkIn').notEmpty().withMessage('Provide check in hour.'),
  body('checkOut').notEmpty().withMessage('Provide check out hour.'),
];
