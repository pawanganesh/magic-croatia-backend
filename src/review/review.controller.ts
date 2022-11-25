import { PrismaClient } from '@prisma/client';
import express, { NextFunction } from 'express';
import authMiddleware from 'middleware/authMiddleware';
import PropertyService from 'property/property.service';
import { RequestWithUserUid } from 'types/express/custom';
import validate from 'validation';
import { createReviewSchema } from 'validation/review/createReviewSchema';
import { CreateReviewDto } from './review.interface';
import ReviewService from './review.service';

class ReviewController {
  public path = '/reviews';
  public router = express.Router();
  public reviewService = new ReviewService(
    new PrismaClient(),
    new PropertyService(new PrismaClient()),
  );

  constructor() {
    this.initializeRoutes();
  }

  public initializeRoutes() {
    this.router.get(
      `${this.path}/properties/:propertyId`,
      this.getReviewsForProperty,
    );
    this.router.post(
      this.path,
      validate(createReviewSchema),
      authMiddleware,
      this.createReview,
    );
  }

  private getReviewsForProperty = async (
    request: express.Request,
    response: express.Response,
  ) => {
    const propertyId: number = +request.params.propertyId;
    const propertyReviews = await this.reviewService.getReviewsForProperty(
      propertyId,
    );
    return response.json(propertyReviews);
  };

  private createReview = async (
    request: RequestWithUserUid,
    response: express.Response,
    next: NextFunction,
  ) => {
    const reviewData: CreateReviewDto = request.body;
    try {
      const createdReview = await this.reviewService.createReview(reviewData);
      return response.json(createdReview);
    } catch (err) {
      next(err);
    }
  };
}

export default ReviewController;
