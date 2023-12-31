import { Prisma } from '@prisma/client';

export interface PropertyReview {
  id: number;
  reviewText: string;
  rating: Prisma.Decimal;
  createdAt: Date;
  userName: string;
  avatar?: string;
}

export type CreateReviewDto = {
  propertyId: number;
  reviewText: string;
  rating: Prisma.Decimal;
};
