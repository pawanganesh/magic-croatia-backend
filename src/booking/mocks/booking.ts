import { Prisma } from "@prisma/client";
import { CreateBookingDto } from "booking/booking.interface";
import { addDays } from "date-fns";

const today = new Date();

export const mockBookingData: CreateBookingDto = {
  startDate: addDays(today, 1),
  endDate: addDays(today, 2),
  propertyId: 1,
  userId: 1,
  totalPrice: new Prisma.Decimal(100.99),
  adultsCount: 2,
  childrenCount: 2,
};
