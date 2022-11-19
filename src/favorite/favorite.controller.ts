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
    this.router.get(`${this.path}/:userId`, this.getAllFavoritesFromUser);
    this.router.post(`${this.path}`, this.createFavorite);
    this.router.delete(`${this.path}`, this.deleteFavorite);
  }

  private getAllFavoritesFromUser = async (
    request: express.Request,
    response: express.Response,
  ) => {
    const userId = +request.params.userId;
    const userFavorites = await this.favoriteService.getAllFavoritesFromUser(
      userId,
    );
    return response.json(userFavorites);
  };

  private deleteFavorite = async (
    request: express.Request,
    response: express.Response,
  ) => {
    const favoriteDto: DeleteFavoriteDto = request.body;
    const createdFavorite = await this.favoriteService.deleteFavorite(
      favoriteDto,
    );
    return response.json(createdFavorite);
  };

  private createFavorite = async (
    request: express.Request,
    response: express.Response,
  ) => {
    const favoriteDto: CreateFavoriteDto = request.body;
    const createdFavorite = await this.favoriteService.createFavorite(
      favoriteDto,
    );
    return response.json(createdFavorite);
  };
}

export default FavoriteController;
