import HttpException from 'exceptions/HttpException';
import { NextFunction, Request, Response } from 'express';
import AuthService from 'services/authService';

async function authMiddleware(
  request: Request,
  response: Response,
  next: NextFunction,
) {
  if (request.headers.authtoken) {
    try {
      const token = await AuthService.admin
        .auth()
        .verifyIdToken(request.headers.authtoken as string);
      console.log({ token });
      request.userUid = token.uid;
      next();
    } catch (_) {
      next(new HttpException(403, 'Found issues with token!'));
    }
  } else {
    next(new HttpException(403, 'No token in header found!'));
  }
}

export default authMiddleware;
