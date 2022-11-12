import express, { NextFunction } from "express";
import { CreateUserDto } from "./user.interface";
import UserService from "./user.service";

class UserController {
  public path = "/users";
  public router = express.Router();
  public userService = new UserService();

  constructor() {
    this.initializeRoutes();
  }

  public initializeRoutes() {
    this.router.get(this.path, this.getAllUsers),
      this.router.post(this.path, this.createUser);
  }

  private getAllUsers = async (
    request: express.Request,
    response: express.Response
  ) => {
    const users = await this.userService.getAllUsers();
    return response.json(users);
  };

  private createUser = async (
    request: express.Request,
    response: express.Response
  ) => {
    const userData: CreateUserDto = request.body;
    const user = await this.userService.createUser(userData);
    return response.json(user);
  };
}

export default UserController;
