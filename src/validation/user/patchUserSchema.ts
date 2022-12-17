import { body } from 'express-validator';

export const patchUserSchema = [
  body('firstName')
    .notEmpty()
    .isString()
    .withMessage('Provide valid first name.'),
  body('lastName')
    .notEmpty()
    .isString()
    .withMessage('Provide valid last name.'),
  body('avatar'),
];
