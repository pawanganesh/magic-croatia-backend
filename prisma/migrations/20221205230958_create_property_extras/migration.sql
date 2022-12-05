-- CreateTable
CREATE TABLE "PropertyExtras" (
    "id" SERIAL NOT NULL,
    "property_id" INTEGER NOT NULL,
    "wifi" BOOLEAN NOT NULL,
    "pool" BOOLEAN NOT NULL,
    "air_condition" BOOLEAN NOT NULL,
    "pets" BOOLEAN NOT NULL,
    "free_parking" BOOLEAN NOT NULL,

    CONSTRAINT "PropertyExtras_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "PropertyExtras" ADD CONSTRAINT "PropertyExtras_property_id_fkey" FOREIGN KEY ("property_id") REFERENCES "properties"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
