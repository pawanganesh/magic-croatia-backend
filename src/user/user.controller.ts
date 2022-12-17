import express, { NextFunction } from 'express';
import authMiddleware from 'middleware/authMiddleware';
import PrismaService from 'services/prismaService';
import { RequestWithUserId } from 'types/express/custom';
import validate from 'validation';
import { createUserSchema } from 'validation/user/createUserSchema';
import { patchUserSchema } from 'validation/user/patchUserSchema';
import { CreateUserDto, PatchUserDto } from './user.interface';
import UserService from './user.service';

class UserController {
  public path = '/users';
  public router = express.Router();
  public userService = new UserService(PrismaService.getPrisma());

  constructor() {
    this.initializeRoutes();
  }

  public initializeRoutes() {
    this.router.get(`${this.path}/me`, authMiddleware, this.getCurrentUser);
    this.router.patch(
      `${this.path}/me`,
      authMiddleware,
      validate(patchUserSchema),
      this.patchCurrentUser,
    );
    this.router.patch(
      `${this.path}/me/avatar`,
      authMiddleware,
      this.updateUserAvatar,
    );
    this.router.post(this.path, validate(createUserSchema), this.createUser);
  }

  private getCurrentUser = async (
    request: RequestWithUserId,
    response: express.Response,
  ) => {
    const userId = +request.userId;
    const currentUser = await this.userService.getCurrentUser(userId);
    return response.json(currentUser);
  };

  private patchCurrentUser = async (
    request: RequestWithUserId,
    response: express.Response,
    next: NextFunction,
  ) => {
    try {
      const userId = +request.userId;
      const patchData: PatchUserDto = request.body;
      const patchedUser = await this.userService.patchCurrentUser({
        userId,
        ...patchData,
      });
      return response.json(patchedUser);
    } catch (err) {
      next(err);
    }
  };

  private updateUserAvatar = async (
    request: RequestWithUserId,
    response: express.Response,
  ) => {
    const avatar: string | undefined = request.body.avatar;
    const userId = +request.userId;
    const updatedUser = await this.userService.updateUserAvatar(userId, avatar);
    return response.json(updatedUser);
  };

  private createUser = async (
    request: express.Request,
    response: express.Response,
  ) => {
    const userData: CreateUserDto = request.body;
    const user = await this.userService.createUser(userData);
    return response.json(user);
  };
}

export default UserController;
