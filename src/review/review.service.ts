import { PrismaClient } from '@prisma/client';
import { CreateReviewDto, PropertyReview } from './review.interface';
import HttpException from 'exceptions/HttpException';
import PropertyService from 'property/property.service';

class ReviewService {
  private prisma: PrismaClient;
  public propertyService: PropertyService;

  constructor(prisma: PrismaClient, propertyService: PropertyService) {
    this.prisma = prisma;
    this.propertyService = propertyService;
  }

  public getReviewsForProperty = async (
    propertyId: number,
  ): Promise<PropertyReview[]> => {
    const propertyReviewsRaw = await this.prisma.review.findMany({
      where: {
        propertyId,
      },
      select: {
        reviewText: true,
        rating: true,
        createdAt: true,
        user: {
          select: {
            firstName: true,
            avatar: true,
          },
        },
      },
      take: 10,
    });
    const propertyReviews = propertyReviewsRaw.map((review) => ({
      reviewText: review.reviewText,
      rating: review.rating,
      createdAt: review.createdAt,
      userName: review.user.firstName,
      avatar: review.user.avatar,
    }));
    return propertyReviews;
  };

  public createReview = async (createReviewDto: CreateReviewDto) => {
    await this.validateReviewBeforeCreate(
      createReviewDto.userId,
      createReviewDto.propertyId,
    );

    const createdReview = await this.prisma.review.create({
      data: {
        ...createReviewDto,
      },
    });
    await this.propertyService.calculatePropertyAverageRating(
      createdReview.propertyId,
    );
    return createdReview;
  };

  private validateReviewBeforeCreate = async (
    userId: number,
    propertyId: number,
  ) => {
    const foundReview = await this.prisma.review.findFirst({
      where: {
        userId,
        propertyId,
      },
    });

    if (foundReview) {
      throw new HttpException(400, 'This property already has your review!');
    }
  };
}

export default ReviewService;
