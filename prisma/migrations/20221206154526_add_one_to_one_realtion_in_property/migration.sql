/*
  Warnings:

  - A unique constraint covering the columns `[property_id]` on the table `property_extras` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "property_extras_property_id_key" ON "property_extras"("property_id");
