import { Request } from 'express';

export interface RequestWithUserUid extends Request {
  userUid: string;
}

export interface InfiniteScrollResponse<T> {
  items: T[];
  nextCursor: { id: number } | null;
}
