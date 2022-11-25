import { PrismaClient } from '@prisma/client';
import express from 'express';
import { CreateUserDto } from './user.interface';
import UserService from './user.service';

class UserController {
  public path = '/users';
  public router = express.Router();
  public userService = new UserService(new PrismaClient());

  constructor() {
    this.initializeRoutes();
  }

  public initializeRoutes() {
    this.router.get(this.path, this.getAllUsers);
    this.router.get(`${this.path}/:uid`, this.getUserByUid);
    this.router.patch(`${this.path}/:id/avatar`, this.updateUserAvatar);
    this.router.post(this.path, this.createUser);
  }

  private getUserByUid = async (
    request: express.Request,
    response: express.Response,
  ) => {
    const uid = request.params.uid;
    const user = await this.userService.findUserByUid(uid);
    return response.json(user);
  };

  private updateUserAvatar = async (
    request: express.Request,
    response: express.Response,
  ) => {
    const id = +request.params.id;
    const avatar: string | undefined = request.body.avatar;
    const user = await this.userService.updateUserAvatar(id, avatar);
    return response.json(user);
  };

  private getAllUsers = async (
    request: express.Request,
    response: express.Response,
  ) => {
    const users = await this.userService.getAllUsers();
    return response.json(users);
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
