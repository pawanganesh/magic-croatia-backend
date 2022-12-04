import { PrismaClient } from '@prisma/client';
import express, { NextFunction } from 'express';
import authMiddleware from 'middleware/authMiddleware';
import PropertyService from 'property/property.service';
import { RequestWithUserId } from 'types/express/custom';
import UserService from 'user/user.service';
import validate from 'validation';
import { createReviewSchema } from 'validation/review/createReviewSchema';
import { CreateReviewDto } from './review.interface';
import ReviewService from './review.service';

class ReviewController {
  public path = '/reviews';
  public router = express.Router();
  public reviewService = new ReviewService(
    new PrismaClient(),
    new PropertyService(
      new PrismaClient(),
      new UserService(new PrismaClient()),
    ),
  );

  constructor() {
    this.initializeRoutes();
  }

  public initializeRoutes() {
    this.router.get(
      `${this.path}/properties/:propertyId`,
      authMiddleware,
      this.getPropertyReviews,
    );
    this.router.post(
      this.path,
      authMiddleware,
      validate(createReviewSchema),
      this.createReview,
    );
  }

  private getPropertyReviews = async (
    request: RequestWithUserId,
    response: express.Response,
  ) => {
    const propertyId: number = +request.params.propertyId;
    const userId: number = +request.userId;
    const propertyReviews = await this.reviewService.getPropertyReviews(
      propertyId,
      userId,
    );
    return response.json(propertyReviews);
  };

  private createReview = async (
    request: RequestWithUserId,
    response: express.Response,
    next: NextFunction,
  ) => {
    const reviewData: CreateReviewDto = request.body;
    const userId = +request.userId;
    try {
      const createdReview = await this.reviewService.createReview({
        ...reviewData,
        userId,
      });
      return response.json(createdReview);
    } catch (err) {
      next(err);
    }
  };
}

export default ReviewController;
