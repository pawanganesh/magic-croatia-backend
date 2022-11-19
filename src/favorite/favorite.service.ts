import { PrismaClient } from '@prisma/client';
import { CreateFavoriteDto, DeleteFavoriteDto } from './favorite.interface';

class FavoriteService {
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  public getAllFavoritesFromUser = async (userId: number) => {
    const favorites = await this.prisma.favorites.findMany({
      where: {
        userId,
      },
    });
    return favorites;
  };

  public createFavorite = async (favoriteDto: CreateFavoriteDto) => {
    const createdFavorite = await this.prisma.favorites.create({
      data: {
        ...favoriteDto,
      },
    });
    return createdFavorite;
  };

  public deleteFavorite = async (favoriteDto: DeleteFavoriteDto) => {
    const deletedFavorite = await this.prisma.favorites.delete({
      where: {
        userId_propertyId: { ...favoriteDto },
      },
    });
    return deletedFavorite;
  };
}

export default FavoriteService;
