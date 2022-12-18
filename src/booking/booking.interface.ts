import { Prisma, Property, Status } from '@prisma/client';

export type CreateBookingDto = {
  totalPrice: Prisma.Decimal;
  adultsCount: number;
  childrenCount: number;
  startDate: Date;
  endDate: Date;
  propertyId: number;
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
  status: Status;
}

export interface BookingCostInputs {
  startDate: Date;
  endDate: Date;
  adultsCount: number;
  childrenCount: number;
  pricePerNight: Prisma.Decimal;
}

export interface CancelBooking {
  bookingId: number;
  userId: number;
}

export interface PropertyBookingReport {
  totalRevenue: number;
  totalYearRevenue: number;
  totalYearBookings: number;
  totalYearBookedDays: number;
}
