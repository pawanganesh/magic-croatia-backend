import { body } from 'express-validator';

export const createUserSchema = [
  body('email').isEmail().withMessage('Provide valid email.'),
  body('firstName')
    .notEmpty()
    .isString()
    .withMessage('Provide valid first name.'),
  body('lastName')
    .notEmpty()
    .isString()
    .withMessage('Provide valid last name.'),
  body('uid').notEmpty().isString().withMessage('Provide valid uid.'),
  body('avatar'),
];
