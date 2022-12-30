import { Prisma, Property, PropertyExtras, PropertyType } from '@prisma/client';
import { CreatePropertyDto } from 'property/property.interface';

export const mockCreatePropertyDto: CreatePropertyDto = {
  name: 'Mocked property',
  description: 'Mocked property description',
  featuredImageUrl:
    'https://res.cloudinary.com/dxn9yllna/image/upload/v1667420247/Houses/digital-marketing-agency-ntwrk-g39p1kDjvSY-unsplash_uxgmne.jpg',
  address: 'Trg bana Josipa Jelačića 3, Zagreb, Croatia',
  gallery: [
    'https://res.cloudinary.com/dxn9yllna/image/upload/v1667420247/Houses/digital-marketing-agency-ntwrk-g39p1kDjvSY-unsplash_uxgmne.jpg',
    'https://res.cloudinary.com/dxn9yllna/image/upload/v1667420247/Houses/digital-marketing-agency-ntwrk-g39p1kDjvSY-unsplash_uxgmne.jpg',
  ],
  pricePerNight: 199.99,
  latitude: 43.446999,
  longitude: 16.692384,
  persons: 4,
  maxChildrenCount: 0,
  bedroomCount: 1,
  size: 50.55,
  checkIn: '17:00',
  checkOut: '09:00',
  propertyExtras: undefined,
  type: PropertyType.APARTMENT,
};

export const mockCreatedProperty: Property = {
  id: 1,
  name: 'Mocked property',
  description: 'Mocked property description',
  featuredImageUrl:
    'https://res.cloudinary.com/dxn9yllna/image/upload/v1667420247/Houses/digital-marketing-agency-ntwrk-g39p1kDjvSY-unsplash_uxgmne.jpg',
  address: 'Trg bana Josipa Jelačića 3, Zagreb, Croatia',
  gallery: [
    'https://res.cloudinary.com/dxn9yllna/image/upload/v1667420247/Houses/digital-marketing-agency-ntwrk-g39p1kDjvSY-unsplash_uxgmne.jpg',
    'https://res.cloudinary.com/dxn9yllna/image/upload/v1667420247/Houses/digital-marketing-agency-ntwrk-g39p1kDjvSY-unsplash_uxgmne.jpg',
  ],
  pricePerNight: new Prisma.Decimal(199.99),
  latitude: 43.446999,
  longitude: 16.692384,
  userId: '10',
  persons: 4,
  type: 'APARTMENT',
  createdAt: new Date('2022-11-15T12:03:17.630Z'),
  updatedAt: new Date('2022-11-15T12:03:17.630Z'),
  averageRating: new Prisma.Decimal(3.5),
  numberOfReviews: 2,
  maxChildrenCount: 0,
  bedroomCount: 1,
  size: new Prisma.Decimal(59.99),
  checkIn: '17:00',
  checkOut: '09:00',
};

export const mockPropertyExtras: PropertyExtras = {
  id: 1,
  propertyId: 1,
  wifi: true,
  pool: true,
  airCondition: true,
  pets: true,
  freeParking: true,
};

export const mockCreatedPropertyWithBookings = {
  ...mockCreatedProperty,
  bookings: [
    { rating: new Prisma.Decimal(2.5) },
    { rating: new Prisma.Decimal(4.0) },
    { rating: new Prisma.Decimal(5.0) },
  ],
};
