import { PrismaClient } from '@prisma/client';
import express, { NextFunction } from 'express';
import authMiddleware from 'middleware/authMiddleware';
import { RequestWithUserUid } from 'types/express/custom';
import UserService from 'user/user.service';
import validate from 'validation';
import { createPropertySchema } from 'validation/property/createPropertySchema';
import { CreatePropertyDto, PropertySearchParams } from './property.interface';
import PropertyService from './property.service';

class PropertyController {
  public path = '/properties';
  public router = express.Router();
  public propertyService = new PropertyService(
    new PrismaClient(),
    new UserService(new PrismaClient()),
  );

  constructor() {
    this.initializeRoutes();
  }

  public initializeRoutes() {
    this.router.get(
      `${this.path}/latest`,
      authMiddleware,
      this.getLatestProperties,
    );
    this.router.get(`${this.path}/:id`, this.getProperty);
    this.router.post(
      this.path,
      validate(createPropertySchema),
      this.createProperty,
    );
    this.router.get(
      `${this.path}/users/:userId`,
      authMiddleware,
      this.getUserProperties,
    );
    this.router.get(
      `${this.path}/search`,
      authMiddleware,
      this.getSearchProperties,
    );
  }

  private getLatestProperties = async (
    request: RequestWithUserUid,
    response: express.Response,
    next: NextFunction,
  ) => {
    try {
      const latestProperties = await this.propertyService.getLatestProperties(
        request.userId,
      );
      return response.json(latestProperties);
    } catch (err) {
      next(err);
    }
  };

  private getProperty = async (
    request: express.Request,
    response: express.Response,
    next: NextFunction,
  ) => {
    try {
      const propertyId = +request.params.id;
      const property = await this.propertyService.getProperty(propertyId);
      return response.json(property);
    } catch (err) {
      next(err);
    }
  };

  private createProperty = async (
    request: express.Request,
    response: express.Response,
    next: NextFunction,
  ) => {
    const createPropertyDto: CreatePropertyDto = request.body;
    try {
      const property = await this.propertyService.createProperty(
        createPropertyDto,
      );
      return response.json(property);
    } catch (err) {
      next(err);
    }
  };

  private getUserProperties = async (
    request: RequestWithUserUid,
    response: express.Response,
    next: NextFunction,
  ) => {
    try {
      const userId = +request.userId;
      const properties = await this.propertyService.getUserProperties(userId);
      return response.json(properties);
    } catch (err) {
      next(err);
    }
  };

  private getSearchProperties = async (
    request: RequestWithUserUid,
    response: express.Response,
    next: NextFunction,
  ) => {
    try {
      const params: PropertySearchParams =
        request.query as unknown as PropertySearchParams;
      const userId = +request.userId;
      const searchedProperties = await this.propertyService.getSearchProperties(
        params,
        userId,
      );
      return response.json(searchedProperties);
    } catch (err) {
      next(err);
    }
  };
}

export default PropertyController;
