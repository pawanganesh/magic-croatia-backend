import { Request } from 'express';

export interface RequestWithUserUid extends Request {
  userId: number;
}

export interface InfiniteScrollResponse<T> {
  items: T[];
  nextCursor: { id: number } | null;
}
