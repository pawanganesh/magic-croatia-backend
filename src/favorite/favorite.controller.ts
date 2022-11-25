import { PrismaClient } from '@prisma/client';
import express from 'express';
import authMiddleware from 'middleware/authMiddleware';
import { RequestWithUserId } from 'types/express/custom';
import validate from 'validation';
import { createFavoriteSchema } from 'validation/favorite/createFavoriteSchema';
import { CreateFavoriteDto, DeleteFavoriteDto } from './favorite.interface';
import FavoriteService from './favorite.service';

class FavoriteController {
  public path = '/favorites';
  public router = express.Router();
  private favoriteService = new FavoriteService(new PrismaClient());

  constructor() {
    this.initializeRoutes();
  }

  public initializeRoutes() {
    this.router.get(
      `${this.path}/users/me`,
      authMiddleware,
      this.getUserFavorites,
    );
    this.router.post(
      `${this.path}`,
      authMiddleware,
      validate(createFavoriteSchema),
      this.createFavorite,
    );
    this.router.delete(`${this.path}`, authMiddleware, this.deleteFavorite);
  }

  private getUserFavorites = async (
    request: RequestWithUserId,
    response: express.Response,
  ) => {
    const userId = +request.userId;
    const userFavorites = await this.favoriteService.getUserFavorites(userId);
    return response.json(userFavorites);
  };

  private createFavorite = async (
    request: RequestWithUserId,
    response: express.Response,
  ) => {
    const createFavoriteDto: CreateFavoriteDto = request.body;
    const userId = +request.userId;
    const createdFavorite = await this.favoriteService.createFavorite({
      ...createFavoriteDto,
      userId,
    });
    return response.json(createdFavorite);
  };

  private deleteFavorite = async (
    request: RequestWithUserId,
    response: express.Response,
  ) => {
    const deleteFavoriteDto: DeleteFavoriteDto = request.body;
    const userId = +request.userId;
    const createdFavorite = await this.favoriteService.deleteFavorite({
      ...deleteFavoriteDto,
      userId,
    });
    return response.json(createdFavorite);
  };
}

export default FavoriteController;
