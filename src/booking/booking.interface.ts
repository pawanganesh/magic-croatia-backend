import { Prisma } from "@prisma/client";

export type CreateBookingDto = {
  totalPrice: Prisma.Decimal;
  startDate: Date;
  endDate: Date;
  propertyId: number;
};

export type ReviewData = {
  review: string;
  rating: number;
};
