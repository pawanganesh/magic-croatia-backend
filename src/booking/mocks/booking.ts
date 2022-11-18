import { Booking, Prisma } from '@prisma/client';
import { CreateBookingDto } from 'booking/booking.interface';
import { addDays } from 'date-fns';
import { PropertyWithBookings } from 'property/property.interface';

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

export const mockPropertyWithBookings: PropertyWithBookings = {
  id: 1,
  name: 'Mocked property',
  description: 'Mocked property desc',
  featuredImageUrl: '',
  gallery: [],
  userId: 1,
  createdAt: new Date(),
  updatedAt: new Date(),
  pricePerNight: new Prisma.Decimal(99.99),
  latitude: 10.1,
  longitude: 10.1,
  averageRating: new Prisma.Decimal(4.5),
  numberOfReviews: 5,
  persons: 4,
  bookings: [],
  address: 'Ilica 3, 10000, Zagreb, Hrvatska',
};

export const mockCreatedBooking: Booking = {
  id: 35,
  propertyId: 2,
  userId: 3,
  startDate: new Date('2022-12-21T00:00:00.000Z'),
  endDate: new Date('2022-12-23T00:00:00.000Z'),
  createdAt: new Date('2022-11-15T12:03:17.630Z'),
  updatedAt: new Date('2022-11-15T12:03:17.630Z'),
  status: 'CREATED',
  totalPrice: new Prisma.Decimal(719.93),
  rating: null,
  review: null,
};
