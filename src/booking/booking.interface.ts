import { Prisma, Property } from '@prisma/client';

export type CreateBookingDto = {
  totalPrice: Prisma.Decimal;
  adultsCount: number;
  childrenCount: number;
  startDate: Date;
  endDate: Date;
  propertyId: number;
  stripePaymentIntent: string;
};

export interface FutureBookingsForProperty {
  id: number;
  startDate: Date;
  endDate: Date;
}

export interface UserBooking {
  id: number;
  startDate: Date;
  endDate: Date;
  totalPrice: Prisma.Decimal;
  property: Property;
  adultsCount: number;
  childrenCount: number;
}

export interface BookingCostInputs {
  startDate: Date;
  endDate: Date;
  adultsCount: number;
  childrenCount: number;
  pricePerNight: Prisma.Decimal;
}
