import { Request } from 'express';

export interface RequestWithUserId extends Request {
  userId: number;
}

export interface InfiniteScrollResponse<T> {
  items: T[];
  nextCursor: { id: number } | null;
}
