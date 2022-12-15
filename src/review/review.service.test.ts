import { Prisma, PrismaClient } from '@prisma/client';
import PropertyService from 'property/property.service';
import UserService from 'user/user.service';
import { CreateReviewDto } from './review.interface';
import ReviewService from './review.service';

describe('Review service tests', () => {
  const prisma = new PrismaClient();
  const reviewService = new ReviewService(
    prisma,
    new PropertyService(prisma, new UserService(prisma)),
  );

  describe('Create review', () => {
    it('should throw', async () => {
      const user = await prisma.user.findFirst({ where: { id: 2 } });
      const property = await prisma.property.findFirst({ where: { id: 1 } });
      const reviewData: CreateReviewDto = {
        propertyId: property.id,
        reviewText: 'Very nice home to be!',
        rating: new Prisma.Decimal(5),
      };
      await prisma.review.create({
        data: {
          propertyId: property.id,
          reviewText: 'Very nice home to be!',
          rating: 5,
          userId: user.id,
        },
      });

      expect(
        reviewService.createReview({ ...reviewData, userId: user.id }),
      ).rejects.toMatchObject({
        message: 'This property already has your review!',
        status: 400,
      });
    });
  });
});
