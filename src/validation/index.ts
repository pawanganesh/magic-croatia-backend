import express, { NextFunction } from 'express';
import { validationResult } from 'express-validator';

const validate = (schemas: any[]) => {
  return async (
    request: express.Request,
    _: express.Response,
    next: NextFunction,
  ) => {
    await Promise.all(schemas.map((schema) => schema.run(request)));

    const result = validationResult(request);
    if (result.isEmpty()) {
      return next();
    }

    const errors = result.array();
    console.log({ errors });

    return next(errors);
  };
};

export default validate;
