import { Request } from 'express';

export interface RequestWithUserId extends Request {
  userId: string;
}

export interface InfiniteScrollResponse<T> {
  items: T[];
  nextCursor: { id: number } | null;
}
