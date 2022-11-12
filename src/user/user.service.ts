import { PrismaClient } from "@prisma/client";
import { CreateUserDto } from "./user.interface";

class UserService {
  private prisma = new PrismaClient();

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
