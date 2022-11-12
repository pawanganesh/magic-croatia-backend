import { PrismaClient } from "@prisma/client";
import HttpException from "exceptions/HttpException";
import { CreateUserDto } from "./user.interface";

class UserService {
  private prisma = new PrismaClient();

  public findUserByUuid = async (userUuid: string) => {
    const user = await this.prisma.user.findFirst({
      where: {
        uuid: userUuid,
      },
    });
    if (!user) {
      throw new HttpException(404, `User with uuid: ${userUuid} not found!`);
    }
    return user;
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
