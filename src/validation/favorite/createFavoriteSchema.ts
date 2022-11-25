import { body } from 'express-validator';

export const createFavoriteSchema = [body('propertyId').isInt()];
