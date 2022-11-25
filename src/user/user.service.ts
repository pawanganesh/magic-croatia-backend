import { PrismaClient, Role } from '@prisma/client';
import HttpException from 'exceptions/HttpException';
import { CreateUserDto } from './user.interface';

class UserService {
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  public findUserById = async (userId: number) => {
    const foundUser = await this.prisma.user.findFirst({
      where: {
        id: userId,
      },
    });
    if (!foundUser) {
      throw new HttpException(404, `User with id ${userId} not found.`);
    }
    return foundUser;
  };

  public findUserByUid = async (userUid: string) => {
    const user = await this.prisma.user.findFirst({
      where: {
        uid: userUid,
      },
    });
    if (!user) {
      throw new HttpException(404, `User with uid: ${userUid} not found!`);
    }
    return user;
  };

  public updateUserRoleToLandlord = async (userId: number) => {
    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: {
        role: Role.LANDLORD,
      },
    });
    if (!updatedUser) {
      throw new HttpException(
        500,
        `User ${userId} has failed to update to landlord!`,
      );
    }
    return updatedUser;
  };

  public updateUserAvatar = async (
    userId: number,
    avatar: string | undefined,
  ) => {
    const updatedUser = await this.prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        avatar,
      },
    });
    if (!updatedUser) {
      throw new HttpException(400, 'Could not update user avatar!');
    }
    return updatedUser;
  };

  public getAllUsers = async () => {
    const users = await this.prisma.user.findMany();
    return users;
  };

  public createUser = async (userData: CreateUserDto) => {
    const createdUser = await this.prisma.user.create({
      data: {
        ...userData,
      },
    });
    return createdUser;
  };
}

export default UserService;
