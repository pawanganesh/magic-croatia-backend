import { body } from "express-validator";

export const createPropertySchema = [
  body("name").notEmpty().withMessage("Provide name."),
  body("description").notEmpty().withMessage("Provide description."),
  body("featuredImageUrl").notEmpty().withMessage("Provide image."),
  body("pricePerNight").isFloat().withMessage("Provide price per night"),
  body("latitude").isFloat().withMessage("Provide latitude"),
  body("longitude").isFloat().withMessage("Provide longitude"),
];
