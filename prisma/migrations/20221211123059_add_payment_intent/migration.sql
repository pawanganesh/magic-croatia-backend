-- AlterTable
ALTER TABLE "bookings" ADD COLUMN     "stripe_payment_intent" TEXT NOT NULL DEFAULT '';
