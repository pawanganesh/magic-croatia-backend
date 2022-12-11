-- CreateEnum
CREATE TYPE "PropertyType" AS ENUM ('APARTMENT', 'HOUSE');

-- AlterTable
ALTER TABLE "properties" ADD COLUMN     "type" "PropertyType" NOT NULL DEFAULT 'APARTMENT';
