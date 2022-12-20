import BookingService from './booking.service';
import { Booking, Property, Prisma, PrismaClient } from '@prisma/client';
import { addDays, subDays } from 'date-fns';
import PropertyService from 'property/property.service';
import {
  mockBookingData,
  mockBookingWithProperty,
  mockCreatedBooking,
  mockPropertyWithBookings,
} from './mocks/booking';
import { calculateBookingCost } from './utils';
import { CreateBookingDto } from './booking.interface';
import PaymentService from 'services/paymentService';
import MailService from 'services/mailService';

const mockedPrismaClient = new (<new () => PrismaClient>(
  PrismaClient
))() as jest.Mocked<PrismaClient>;

describe('Booking service tests', () => {
  const mockedPropertyService = new (<new () => PropertyService>(
    PropertyService
  ))() as jest.Mocked<PropertyService>;

  const mockedPaymentService = new (<new () => PaymentService>(
    PaymentService
  ))() as jest.Mocked<PaymentService>;
  const mockedMailService = new (<new () => MailService>(
    MailService
  ))() as jest.Mocked<MailService>;
  mockedMailService.sendEmail = jest.fn().mockResolvedValue(true);

  const bookingService = new BookingService(
    mockedPrismaClient,
    mockedPropertyService,
    mockedPaymentService,
    mockedMailService,
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

    it('should throw when number of people in booking bot the same as persons of property', async () => {
      const bookingData: CreateBookingDto = {
        ...mockBookingData,
        adultsCount: 2,
        childrenCount: 2,
      };
      jest.spyOn(mockedPropertyService, 'getProperty').mockResolvedValue({
        ...mockPropertyWithBookings,
        persons: 5,
      });

      expect(
        bookingService.createBooking({ ...bookingData, userId: 1 }),
      ).rejects.toMatchObject({
        message: `Required number of people for this property is 5`,
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

      jest
        .spyOn(mockedPaymentService, 'createPaymentIntent')
        .mockResolvedValue({
          id: 'payment_intent_id',
          client_secret: 'client_secret',
        } as never);

      await bookingService.createBooking({ ...bookingData, userId: 1 });
      expect(mockedPrismaClient.booking.create).toHaveBeenCalledWith({
        data: {
          totalPrice: bookingData.totalPrice,
          startDate: bookingData.startDate,
          endDate: bookingData.endDate,
          userId: mockPropertyWithBookings.userId,
          propertyId: mockPropertyWithBookings.id,
          adultsCount: bookingData.adultsCount,
          childrenCount: bookingData.childrenCount,
          stripePaymentIntent: 'payment_intent_id',
        },
      });
    });
  });

  describe('Cancel booking', () => {
    const bookingId = 1;
    const userId = 1;

    beforeEach(() => {
      jest.restoreAllMocks();
    });

    it('should throw when booking is not found', async () => {
      jest
        .spyOn(mockedPrismaClient.booking, 'findFirst')
        .mockResolvedValue(undefined);

      expect(
        bookingService.cancelBooking({ bookingId, userId }),
      ).rejects.toMatchObject({
        message: `Booking #${bookingId} not found for user #${userId}`,
        status: 404,
      });
    });

    it('should throw when booking is already cancelled', async () => {
      const booking: Booking = { ...mockCreatedBooking, status: 'CANCELED' };
      jest
        .spyOn(mockedPrismaClient.booking, 'findFirst')
        .mockResolvedValue(booking);

      expect(
        bookingService.cancelBooking({ bookingId, userId }),
      ).rejects.toMatchObject({
        message: `Booking #${booking.id} is already cancelled!`,
        status: 400,
      });
    });

    it('should throw when booking start date is lower than today', async () => {
      const booking: Booking & {
        property: Partial<Property>;
      } = {
        ...mockBookingWithProperty,
        startDate: subDays(new Date(), 1),
      };
      jest
        .spyOn(mockedPrismaClient.booking, 'findFirst')
        .mockResolvedValue(booking);

      expect(
        bookingService.cancelBooking({ bookingId, userId }),
      ).rejects.toMatchObject({
        message: /^Booking cancelation time has passed/,
        status: 400,
      });
    });

    it('should throw when booking start date is equal to today', async () => {
      const booking: Booking = {
        ...mockBookingWithProperty,
        startDate: new Date(),
      };
      jest
        .spyOn(mockedPrismaClient.booking, 'findFirst')
        .mockResolvedValue(booking);

      expect(
        bookingService.cancelBooking({ bookingId, userId }),
      ).rejects.toMatchObject({
        status: 400,
      });
    });

    it('should throw when booking start date is equal to today', async () => {
      const booking: Booking = {
        ...mockBookingWithProperty,
        startDate: addDays(new Date(), 30),
      };
      jest
        .spyOn(mockedPrismaClient.booking, 'findFirst')
        .mockResolvedValue(booking);

      const mockedRefundAmount =
        parseFloat(booking.totalPrice.toString()) * 100;
      jest
        .spyOn(bookingService, 'calculateBookingRefund')
        .mockReturnValueOnce(mockedRefundAmount);

      expect(
        bookingService.cancelBooking({ bookingId, userId }),
      ).rejects.toMatchObject({
        message: 'Error while calculating refund amount!',
        status: 400,
      });
    });

    it('should throw when refund is not successful', async () => {
      const booking: Booking = {
        ...mockBookingWithProperty,
        totalPrice: new Prisma.Decimal(199.99),
        startDate: addDays(new Date(), 30),
      };
      jest
        .spyOn(mockedPrismaClient.booking, 'findFirst')
        .mockResolvedValue(booking);

      jest
        .spyOn(mockedPaymentService, 'createRefund')
        .mockResolvedValue({ status: 'fail' } as never);

      expect(
        bookingService.cancelBooking({ bookingId, userId }),
      ).rejects.toMatchObject({
        message: `Error while refunding booking #${booking.id} with amount 159.99`,
        status: 400,
      });
    });

    it('should throw when booking is not updated', async () => {
      const booking: Booking = {
        ...mockBookingWithProperty,
        totalPrice: new Prisma.Decimal(199.99),
        startDate: addDays(new Date(), 29),
      };
      jest
        .spyOn(mockedPrismaClient.booking, 'findFirst')
        .mockResolvedValue(booking);

      jest
        .spyOn(mockedPaymentService, 'createRefund')
        .mockResolvedValue({ status: 'succeeded' } as never);

      jest
        .spyOn(mockedPrismaClient.booking, 'update')
        .mockResolvedValue(undefined);

      expect(
        bookingService.cancelBooking({ bookingId, userId }),
      ).rejects.toMatchObject({
        message: `Error while updating booking #${booking.id} status`,
        status: 400,
      });
    });

    it('should successfuly refund and mark booking as cancelled', async () => {
      const booking: Booking = {
        ...mockBookingWithProperty,
        totalPrice: new Prisma.Decimal(199.99),
        startDate: addDays(new Date(), 29),
      };
      jest
        .spyOn(mockedPrismaClient.booking, 'findFirst')
        .mockResolvedValue(booking);

      jest
        .spyOn(mockedPaymentService, 'createRefund')
        .mockResolvedValue({ status: 'succeeded' } as never);

      jest
        .spyOn(mockedPrismaClient.booking, 'update')
        .mockResolvedValue({} as never);

      await bookingService.cancelBooking({ bookingId, userId });

      expect(mockedPaymentService.createRefund).toHaveBeenCalledWith(
        '123',
        10000,
      );
    });
  });
});
