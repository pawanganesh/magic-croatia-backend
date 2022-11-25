/*
  Warnings:

  - You are about to drop the column `rating` on the `bookings` table. All the data in the column will be lost.
  - You are about to drop the column `review` on the `bookings` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "bookings" DROP COLUMN "rating",
DROP COLUMN "review";

-- CreateTable
CREATE TABLE "reviews" (
    "id" SERIAL NOT NULL,
    "property_id" INTEGER NOT NULL,
    "user_id" INTEGER NOT NULL,
    "review_text" TEXT NOT NULL,
    "rating" DECIMAL(65,30) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "reviews_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_property_id_fkey" FOREIGN KEY ("property_id") REFERENCES "properties"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
