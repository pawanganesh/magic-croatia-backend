import { Prisma, Property } from '@prisma/client';

export interface CreatePropertyDto {
  name: string;
  description: string;
  featuredImageUrl: string;
  gallery: string[];
  pricePerNight: number;
  latitude: number;
  longitude: number;
  userId: number;
  persons: number;
}

export interface PropertyWithBookings extends Property {
  bookings: {
    rating: Prisma.Decimal;
    review: string;
  }[];
}
