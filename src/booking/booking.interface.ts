import { Prisma, Property } from "@prisma/client";

export type CreateBookingDto = {
  totalPrice: Prisma.Decimal;
  adultCount: number;
  childrenCount: number;
  startDate: Date;
  endDate: Date;
  propertyId: number;
  userId: number;
};

export type ReviewData = {
  review: string;
  rating: number;
};

export interface FutureBookingsForProperty {
  id: number;
  startDate: Date;
  endDate: Date;
}

export interface MyBooking {
  id: number;
  startDate: Date;
  endDate: Date;
  totalPrice: Prisma.Decimal;
  property: Property;
}

export interface BookingCostInputs {
  startDate: Date;
  endDate: Date;
  adultCount: number;
  childrenCount: number;
  pricePerNight: Prisma.Decimal;
}
