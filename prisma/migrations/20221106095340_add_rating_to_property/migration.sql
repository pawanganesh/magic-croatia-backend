-- AlterTable
ALTER TABLE "properties" ADD COLUMN     "averageRating" DECIMAL(10,2) NOT NULL DEFAULT 0.00,
ADD COLUMN     "numberOfReviews" INTEGER NOT NULL DEFAULT 0;
