import { Booking } from "@prisma/client";

export type CreateBookingDto = Omit<Booking, "userId">;

export type ReviewData = {
  review: string;
  rating: number;
};
