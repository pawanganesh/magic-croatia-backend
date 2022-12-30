import { PrismaClient } from '@prisma/client';
import { CreateFavoriteDto, DeleteFavoriteDto } from './favorite.interface';

class FavoriteService {
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  public getUserFavoriteProperties = async (userId: string) => {
    const favorites = await this.prisma.favorites.findMany({
      where: {
        userId,
      },
      include: {
        property: true,
      },
    });
    return favorites;
  };

  public getUserFavorites = async (userId: string) => {
    const favorites = await this.prisma.favorites.findMany({
      where: {
        userId,
      },
    });
    return favorites;
  };

  public createFavorite = async (
    favoriteDto: CreateFavoriteDto & { userId: string },
  ) => {
    const createdFavorite = await this.prisma.favorites.create({
      data: {
        ...favoriteDto,
      },
    });
    return createdFavorite;
  };

  public deleteFavorite = async (
    deleteFavoriteDto: DeleteFavoriteDto & { userId: string },
  ) => {
    const deletedFavorite = await this.prisma.favorites.delete({
      where: {
        userId_propertyId: { ...deleteFavoriteDto },
      },
    });
    return deletedFavorite;
  };
}

export default FavoriteService;
