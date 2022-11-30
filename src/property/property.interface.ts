import { Prisma, Property } from '@prisma/client';

export interface CreatePropertyDto {
  name: string;
  description: string;
  featuredImageUrl: string;
  address: string;
  gallery: string[];
  pricePerNight: number;
  latitude: number;
  longitude: number;
  persons: number;
}

export interface PropertyWithReviews extends Property {
  reviews: {
    rating: Prisma.Decimal;
    reviewText: string;
  }[];
}

export interface PropertySearchParams {
  search: string;
  cursor: Prisma.PropertyWhereUniqueInput;
  startDate?: string;
  endDate?: string;
  persons?: number;
  minPrice?: number;
  maxPrice?: number;
}
