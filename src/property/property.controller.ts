import express, { NextFunction } from 'express';
import authMiddleware from 'middleware/authMiddleware';
import PrismaService from 'services/prismaService';
import { RequestWithUserId } from 'types/express/custom';
import UserService from 'user/user.service';
import validate from 'validation';
import { createPropertySchema } from 'validation/property/createPropertySchema';
import {
  CreatePropertyDto,
  PropertyQuickSearch,
  PropertySearchParams,
} from './property.interface';
import PropertyService from './property.service';

class PropertyController {
  public path = '/properties';
  public router = express.Router();
  public propertyService = new PropertyService(
    PrismaService.getPrisma(),
    new UserService(PrismaService.getPrisma()),
  );

  constructor() {
    this.initializeRoutes();
  }

  public initializeRoutes() {
    this.router.get(
      `${this.path}/popular`,
      authMiddleware,
      this.getPopularProperties,
    );
    this.router.get(
      `${this.path}/latest`,
      authMiddleware,
      this.getLatestProperties,
    );
    this.router.get(
      `${this.path}/users/me`,
      authMiddleware,
      this.getUserProperties,
    );
    this.router.get(
      `${this.path}/search`,
      authMiddleware,
      this.getSearchProperties,
    ),
      this.router.get(`${this.path}/:id`, this.getProperty);
    this.router.post(
      this.path,
      authMiddleware,
      validate(createPropertySchema),
      this.createProperty,
    );
  }

  private getPopularProperties = async (
    request: RequestWithUserId,
    response: express.Response,
    next: NextFunction,
  ) => {
    try {
      const params: PropertyQuickSearch =
        request.query as unknown as PropertyQuickSearch;
      const popularProperties = await this.propertyService.getPopularProperties(
        request.userId,
        params,
      );
      return response.json(popularProperties);
    } catch (err) {
      next(err);
    }
  };

  private getLatestProperties = async (
    request: RequestWithUserId,
    response: express.Response,
    next: NextFunction,
  ) => {
    try {
      const params: PropertyQuickSearch =
        request.query as unknown as PropertyQuickSearch;
      const latestProperties = await this.propertyService.getLatestProperties(
        request.userId,
        params,
      );
      return response.json(latestProperties);
    } catch (err) {
      next(err);
    }
  };

  private getUserProperties = async (
    request: RequestWithUserId,
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
    request: RequestWithUserId,
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
    request: RequestWithUserId,
    response: express.Response,
    next: NextFunction,
  ) => {
    const createPropertyDto: CreatePropertyDto = request.body;
    const userId: number = +request.userId;
    try {
      const property = await this.propertyService.createProperty({
        ...createPropertyDto,
        userId,
      });
      return response.json(property);
    } catch (err) {
      console.log();
      next(err);
    }
  };
}

export default PropertyController;
