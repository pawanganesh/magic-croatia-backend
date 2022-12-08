/*
  Warnings:

  - Added the required column `adults_count` to the `bookings` table without a default value. This is not possible if the table is not empty.
  - Added the required column `children_count` to the `bookings` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "bookings" ADD COLUMN     "adults_count" INTEGER NOT NULL,
ADD COLUMN     "children_count" INTEGER NOT NULL;
