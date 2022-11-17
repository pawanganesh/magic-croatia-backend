import express, { NextFunction } from 'express';
import validate from 'validation';
import { createPropertySchema } from 'validation/property/createPropertySchema';
import { CreatePropertyDto } from './property.interface';
import PropertyService from './property.service';

class PropertyController {
  public path = '/properties';
  public router = express.Router();
  public propertyService = new PropertyService();

  constructor() {
    this.initializeRoutes();
  }

  public initializeRoutes() {
    this.router.get(`${this.path}/personal/:userId`, this.getMyProperties);
    this.router.get(
      `${this.path}/personal/:userId/names`,
      this.getMyPropertyNames,
    );
    this.router.get(`${this.path}/:id`, this.getProperty);
    this.router.post(
      this.path,
      validate(createPropertySchema),
      this.createProperty,
    );
  }

  private getProperty = async (
    request: express.Request,
    response: express.Response,
    next: NextFunction,
  ) => {
    const propertyId = +request.params.id;
    const property = await this.propertyService.getProperty(propertyId);
    return response.json(property);
  };

  private getMyProperties = async (
    request: express.Request,
    response: express.Response,
    next: NextFunction,
  ) => {
    const userId = +request.params.userId;
    const properties = await this.propertyService.getMyProperties(userId);
    return response.json(properties);
  };

  private getMyPropertyNames = async (
    request: express.Request,
    response: express.Response,
    next: NextFunction,
  ) => {
    const userId = +request.params.userId;
    const propertyNames = await this.propertyService.getMyPropertyNames(userId);
    return response.json(propertyNames);
  };

  private createProperty = async (
    request: express.Request,
    response: express.Response,
    next: NextFunction,
  ) => {
    const propertyData: CreatePropertyDto = request.body;
    try {
      const property = await this.propertyService.createProperty(propertyData);
      return response.json(property);
    } catch (err) {
      next(err);
    }
  };
}

export default PropertyController;
