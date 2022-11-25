import BookingService from './booking.service';
import { Prisma, PrismaClient } from '@prisma/client';
import { addDays } from 'date-fns';
import PropertyService from 'property/property.service';
import {
  mockBookingData,
  mockCreatedBooking,
  mockPropertyWithBookings,
} from './mocks/booking';
import { calculateBookingCost } from './utils';
import { CreateBookingDto } from './booking.interface';

const mockedPrismaClient = new (<new () => PrismaClient>(
  PrismaClient
))() as jest.Mocked<PrismaClient>;

describe('Booking service tests', () => {
  const mockedPropertyService = new (<new () => PropertyService>(
    PropertyService
  ))() as jest.Mocked<PropertyService>;

  const bookingService = new BookingService(
    mockedPrismaClient,
    mockedPropertyService,
  );
  bookingService.getFuturePropertyBookings = jest.fn().mockResolvedValue([]);

  const today = new Date();

  describe('Create booking', () => {
    it("should throw when start date is before tomorrow's date", async () => {
      const bookingData: CreateBookingDto = {
        ...mockBookingData,
        startDate: today,
      };
      expect(
        bookingService.createBooking({ ...bookingData, userId: 1 }),
      ).rejects.toMatchObject({
        message: 'Invalid start date!',
        status: 400,
      });
    });

    it('should throw when end date is before start date', async () => {
      const bookingData = {
        ...mockBookingData,
        endDate: mockBookingData.startDate,
      };
      expect(
        bookingService.createBooking({ ...bookingData, userId: 1 }),
      ).rejects.toMatchObject({
        message: 'Invalid end date!',
        status: 400,
      });
    });

    it('should throw when booking date range in already booked range', async () => {
      const bookingData: CreateBookingDto = {
        ...mockBookingData,
        startDate: addDays(today, 3),
        endDate: addDays(today, 6),
      };
      bookingService.getFuturePropertyBookings = jest
        .fn()
        .mockResolvedValue([
          { id: 1, startDate: addDays(today, 2), endDate: addDays(today, 4) },
        ]);

      expect(
        bookingService.createBooking({ ...bookingData, userId: 1 }),
      ).rejects.toMatchObject({
        message: 'Chosen dates for this property are not available!',
        status: 400,
      });
    });
  });

  it('should throw when number of people in booking is over allowed maximum of property', async () => {
    const bookingData: CreateBookingDto = {
      ...mockBookingData,
      adultsCount: 2,
      childrenCount: 3,
    };
    jest.spyOn(mockedPropertyService, 'getProperty').mockResolvedValue({
      ...mockPropertyWithBookings,
      persons: 4,
    });

    expect(
      bookingService.createBooking({ ...bookingData, userId: 1 }),
    ).rejects.toMatchObject({
      message: `Maximum number of people for this property is ${mockPropertyWithBookings.persons}`,
      status: 400,
    });
  });

  it('should throw when FE price is not the same as BE calculated price', async () => {
    const bookingData: CreateBookingDto = {
      ...mockBookingData,
      adultsCount: 2,
      childrenCount: 2,
      startDate: addDays(today, 1),
      endDate: addDays(today, 3),
      totalPrice: new Prisma.Decimal(719.94),
    };
    const pricePerNight = new Prisma.Decimal(99.99);

    jest.spyOn(mockedPropertyService, 'getProperty').mockResolvedValue({
      ...mockPropertyWithBookings,
      pricePerNight,
    });

    const bookedPrice = calculateBookingCost({
      ...bookingData,
      pricePerNight,
    }).toString();

    expect(bookedPrice).toBe('719.93');
    expect(
      bookingService.createBooking({ ...bookingData, userId: 1 }),
    ).rejects.toMatchObject({
      message: `Calculated price is not the same!`,
      status: 400,
    });
  });

  it('should call create booking method with correct params', async () => {
    const bookingData: CreateBookingDto = {
      ...mockBookingData,
      adultsCount: 2,
      childrenCount: 2,
      startDate: addDays(today, 1),
      endDate: addDays(today, 3),
      totalPrice: new Prisma.Decimal(719.93),
    };

    jest
      .spyOn(mockedPrismaClient.booking, 'create')
      .mockResolvedValue(mockCreatedBooking);

    jest.spyOn(mockedPropertyService, 'getProperty').mockResolvedValue({
      ...mockPropertyWithBookings,
      userId: 1,
      id: 1,
    });

    await bookingService.createBooking({ ...bookingData, userId: 1 });
    expect(mockedPrismaClient.booking.create).toHaveBeenCalledWith({
      data: {
        totalPrice: bookingData.totalPrice,
        startDate: bookingData.startDate,
        endDate: bookingData.endDate,
        userId: mockPropertyWithBookings.userId,
        propertyId: mockPropertyWithBookings.id,
      },
    });
  });
});
