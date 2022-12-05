/*
  Warnings:

  - You are about to drop the `PropertyExtras` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "PropertyExtras" DROP CONSTRAINT "PropertyExtras_property_id_fkey";

-- DropTable
DROP TABLE "PropertyExtras";

-- CreateTable
CREATE TABLE "property_extras" (
    "id" SERIAL NOT NULL,
    "property_id" INTEGER NOT NULL,
    "wifi" BOOLEAN NOT NULL,
    "pool" BOOLEAN NOT NULL,
    "air_condition" BOOLEAN NOT NULL,
    "pets" BOOLEAN NOT NULL,
    "free_parking" BOOLEAN NOT NULL,

    CONSTRAINT "property_extras_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "property_extras" ADD CONSTRAINT "property_extras_property_id_fkey" FOREIGN KEY ("property_id") REFERENCES "properties"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
