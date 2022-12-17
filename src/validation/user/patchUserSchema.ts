import { body } from 'express-validator';

export const patchUserSchema = [
  body('firstName'),
  body('lastName'),
  body('avatar'),
];
