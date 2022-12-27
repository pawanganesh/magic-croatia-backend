import { PrismaClient } from '@prisma/client';
import HttpException from 'exceptions/HttpException';
import { getObjectWithTruthyValues } from 'utils/object';
import { CreateUserDto, PatchUserDto } from './user.interface';

class UserService {
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  public getCurrentUser = async (userId: number) => {
    const currentUser = await this.prisma.user.findUnique({
      where: {
        id: userId,
      },
    });
    if (!currentUser) {
      throw new HttpException(404, `User with id ${userId} not found!`);
    }
    return currentUser;
  };

  public patchCurrentUser = async ({
    userId,
    patchData,
  }: {
    userId: number;
    patchData: PatchUserDto;
  }) => {
    const parsedPatchData = getObjectWithTruthyValues(patchData);
    const patchedUser = await this.prisma.user.update({
      where: {
        id: userId,
      },
      data: { avatar: patchData.avatar, ...parsedPatchData },
    });
    if (!patchedUser) {
      throw new HttpException(
        400,
        `Error while updating user with id ${userId}.`,
      );
    }
    return patchedUser;
  };

  public createUser = async (userData: CreateUserDto) => {
    const createdUser = await this.prisma.user.create({
      data: {
        ...userData,
      },
    });
    return createdUser;
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
}

export default UserService;
