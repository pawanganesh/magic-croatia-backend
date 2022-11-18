import HttpException from 'exceptions/HttpException';
import { NextFunction, Response } from 'express';
import AuthService from 'services/authService';
import { RequestWithUserUid } from 'types/express/custom';

async function authMiddleware(
  request: RequestWithUserUid,
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
