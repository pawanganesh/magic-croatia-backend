/*
  Warnings:

  - You are about to drop the `Review` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `rating` to the `Booking` table without a default value. This is not possible if the table is not empty.
  - Added the required column `review` to the `Booking` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Review" DROP CONSTRAINT "Review_property_id_fkey";

-- DropForeignKey
ALTER TABLE "Review" DROP CONSTRAINT "Review_user_id_fkey";

-- AlterTable
ALTER TABLE "Booking" ADD COLUMN     "rating" DECIMAL(65,30) NOT NULL,
ADD COLUMN     "review" TEXT NOT NULL;

-- DropTable
DROP TABLE "Review";
