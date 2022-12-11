import HttpException from 'exceptions/HttpException';
import { NextFunction, Response } from 'express';
import AuthService from 'services/authService';
import PrismaService from 'services/prismaService';
import { RequestWithUserId } from 'types/express/custom';
import UserService from 'user/user.service';

async function authMiddleware(
  request: RequestWithUserId,
  response: Response,
  next: NextFunction,
) {
  const userService = new UserService(PrismaService.getPrisma());
  if (request.headers.authtoken) {
    try {
      const token = await AuthService.admin
        .auth()
        .verifyIdToken(request.headers.authtoken as string);
      const foundUser = await userService.findUserByUid(token.uid);
      request.userId = foundUser.id;
      next();
    } catch (_) {
      next(new HttpException(403, 'Found issues with token!'));
    }
  } else {
    next(new HttpException(403, 'No token in header found!'));
  }
}

export default authMiddleware;
