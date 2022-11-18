import { Request } from 'express';

export interface RequestWithUserUid extends Request {
  userUid: string;
}
