import { PrismaClient } from '@prisma/client';
import { CreateFavoriteDto, DeleteFavoriteDto } from './favorite.interface';

class FavoriteService {
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  public getUserFavorites = async (userId: number) => {
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

  public deleteFavorite = async (deleteFavoriteDto: DeleteFavoriteDto) => {
    const deletedFavorite = await this.prisma.favorites.delete({
      where: {
        userId_propertyId: { ...deleteFavoriteDto },
      },
    });
    return deletedFavorite;
  };
}

export default FavoriteService;
