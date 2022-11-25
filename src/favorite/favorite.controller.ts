import { PrismaClient } from '@prisma/client';
import express from 'express';
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
    this.router.get(`${this.path}/users/:userId`, this.getUserFavorites);
    this.router.post(`${this.path}`, this.createFavorite);
    this.router.delete(`${this.path}`, this.deleteFavorite);
  }

  private getUserFavorites = async (
    request: express.Request,
    response: express.Response,
  ) => {
    const userId = +request.params.userId;
    const userFavorites = await this.favoriteService.getUserFavorites(userId);
    return response.json(userFavorites);
  };

  private createFavorite = async (
    request: express.Request,
    response: express.Response,
  ) => {
    const createFavoriteDto: CreateFavoriteDto = request.body;
    const createdFavorite = await this.favoriteService.createFavorite(
      createFavoriteDto,
    );
    return response.json(createdFavorite);
  };

  private deleteFavorite = async (
    request: express.Request,
    response: express.Response,
  ) => {
    const deleteFavoriteDto: DeleteFavoriteDto = request.body;
    const createdFavorite = await this.favoriteService.deleteFavorite(
      deleteFavoriteDto,
    );
    return response.json(createdFavorite);
  };
}

export default FavoriteController;
