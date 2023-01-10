import { Prisma, PrismaClient } from '@prisma/client';
import { addDays } from 'date-fns';
import PaymentService from './payment.service';

import { calculateBookingRefund } from './utils';
jest.mock('./utils', () => ({
  calculateBookingRefund: jest.fn().mockImplementation(() => 200.0),
}));

const mockedPrismaClient = new (<new () => PrismaClient>(
  PrismaClient
))() as jest.Mocked<PrismaClient>;

describe('Payment service tests', () => {
  const paymentService = new PaymentService(mockedPrismaClient);

  describe('Create booking refund', () => {
    const bookingStartDate = addDays(new Date(), 1);

    afterEach(() => {
      jest.clearAllMocks();
    });

    // Mock findBookingForRefund private function
    const mockFindBookingForRefund = jest.spyOn(
      paymentService as unknown as {
        findBookingForRefund: PaymentService['findBookingForRefund'];
      },
      'findBookingForRefund',
    );

    // Mock createPaymentRefund private function
    const mockCreatePaymentRefund = jest.spyOn(
      paymentService as unknown as {
        createPaymentRefund: PaymentService['createPaymentRefund'];
      },
      'createPaymentRefund',
    );

    // Mock updateBookingWithRefundId private function
    const mockUpdateBookingWithRefundId = jest.spyOn(
      paymentService as unknown as {
        updateBookingWithRefundId: PaymentService['updateBookingWithRefundId'];
      },
      'updateBookingWithRefundId',
    );

    it('should throw when booking is not found', async () => {
      mockFindBookingForRefund.mockResolvedValue(null);

      expect(
        paymentService.createBookingRefund({ bookingId: 1, userId: '1' }),
      ).rejects.toMatchObject({
        status: 404,
        message: `Booking with id #${1} not found!`,
      });
    });

    it('should throw when refund amount is greater than booking price', async () => {
      mockFindBookingForRefund.mockResolvedValue({
        id: 1,
        startDate: bookingStartDate,
        totalPrice: new Prisma.Decimal(199.99),
      } as any);

      expect(
        paymentService.createBookingRefund({ bookingId: 1, userId: '1' }),
      ).rejects.toMatchObject({
        status: 400,
        message: 'Error while calculating refund amount!',
      });
    });

    it('should throw when refund is undefined', async () => {
      mockFindBookingForRefund.mockResolvedValue({
        id: 1,
        startDate: bookingStartDate,
        totalPrice: new Prisma.Decimal(899.99),
        stripePaymentIntent: '123',
      } as any);

      mockCreatePaymentRefund.mockResolvedValue(undefined);

      expect(
        paymentService.createBookingRefund({ bookingId: 1, userId: '1' }),
      ).rejects.toMatchObject({
        status: 500,
        message: 'Error while creating refund!',
      });
    });

    it('should create proper refund response', async () => {
      mockFindBookingForRefund.mockResolvedValue({
        id: 1,
        startDate: bookingStartDate,
        totalPrice: new Prisma.Decimal(899.99),
        stripePaymentIntent: '123',
      } as any);

      mockCreatePaymentRefund.mockResolvedValue({
        status: 'succeeded',
        id: '1',
      } as any);

      mockUpdateBookingWithRefundId.mockResolvedValue({ id: 1 } as any);

      await paymentService.createBookingRefund({ bookingId: 1, userId: '1' });

      expect(calculateBookingRefund).toHaveBeenCalledWith(
        bookingStartDate,
        899.99,
      );
      expect(mockUpdateBookingWithRefundId).toHaveBeenCalledWith(1, {
        status: 'succeeded',
        id: '1',
      });
      expect(mockCreatePaymentRefund).toHaveBeenCalledWith('123', 200);
    });
  });
});
