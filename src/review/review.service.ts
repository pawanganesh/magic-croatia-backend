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

  public getUserPropertyReview = async (propertyId: number, userId: string) => {
    const foundReview = await this.prisma.review.findFirst({
      where: {
        userId,
        propertyId,
      },
    });
    return foundReview;
  };

  public getPropertyReviews = async (
    propertyId: number,
    userId: string,
  ): Promise<PropertyReview[]> => {
    const propertyReviewsRaw = await this.prisma.review.findMany({
      where: {
        propertyId,
        userId: {
          not: userId,
        },
      },
      select: {
        id: true,
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
      id: review.id,
      reviewText: review.reviewText,
      rating: review.rating,
      createdAt: review.createdAt,
      userName: review.user.firstName,
      avatar: review.user.avatar,
    }));
    return propertyReviews;
  };

  public createReview = async (
    createReviewDto: CreateReviewDto & { userId: string },
  ) => {
    const foundReview = await this.getUserPropertyReview(
      createReviewDto.propertyId,
      createReviewDto.userId,
    );
    if (foundReview) {
      throw new HttpException(400, 'This property already has your review!');
    }

    const propertyRatings = await this.prisma.property.findFirst({
      where: { id: createReviewDto.propertyId },
      select: {
        averageRating: true,
        numberOfReviews: true,
      },
    });
    if (!propertyRatings) {
      throw new HttpException(
        404,
        `Property #${createReviewDto.propertyId} not found!`,
      );
    }

    const parsedAverageRating = parseFloat(
      propertyRatings.averageRating.toString(),
    );
    const parsedNewRating = parseFloat(createReviewDto.rating.toString());

    const newAverageRating =
      (parsedAverageRating + parsedNewRating) /
      (propertyRatings.numberOfReviews + 1);

    return await this.prisma.$transaction(async (tx) => {
      await tx.property.update({
        where: { id: createReviewDto.propertyId },
        data: {
          averageRating: newAverageRating,
          numberOfReviews: propertyRatings.numberOfReviews + 1,
        },
      });

      const createdReview = await tx.review.create({
        data: {
          ...createReviewDto,
        },
      });

      return createdReview;
    });
  };
}

export default ReviewService;
