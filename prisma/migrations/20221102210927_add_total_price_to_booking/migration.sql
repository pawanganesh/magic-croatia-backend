/*
  Warnings:

  - Added the required column `total_price` to the `Booking` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Booking" ADD COLUMN     "total_price" DECIMAL(65,30) NOT NULL;
