import { Booking } from "@prisma/client";

export type CreateBookingDto = Omit<Booking, "userId">;
