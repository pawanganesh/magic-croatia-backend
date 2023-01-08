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
    it('should throw when booking is not found', async () => {
      jest
        .spyOn(mockedPrismaClient.booking, 'findFirst')
        .mockResolvedValue(null);

      expect(
        paymentService.createBookingRefund({ bookingId: 1, userId: '1' }),
      ).rejects.toMatchObject({
        status: 404,
        message: `Booking with id #${1} bot found!`,
      });
    });

    it('should throw when refund amount is greater than booking price', async () => {
      jest.spyOn(mockedPrismaClient.booking, 'findFirst').mockResolvedValue({
        id: 1,
        startDate: addDays(new Date(), 1),
        totalPrice: new Prisma.Decimal(199.99),
      } as any);

      expect(
        paymentService.createBookingRefund({ bookingId: 1, userId: '1' }),
      ).rejects.toMatchObject({
        status: 400,
        message: 'Error while calculating refund amount!',
      });
    });

    it('should create proper refund response', async () => {
      jest.spyOn(mockedPrismaClient.booking, 'findFirst').mockResolvedValue({
        id: 1,
        startDate: addDays(new Date(), 1),
        totalPrice: new Prisma.Decimal(899.99),
        stripePaymentIntent: '123',
      } as any);

      const mockedCreatePaymentRefund = jest
        .spyOn(
          paymentService as unknown as {
            createPaymentRefund: PaymentService['createPaymentRefund'];
          },
          'createPaymentRefund',
        )
        .mockResolvedValue({ status: 'succeeded' } as any);

      await paymentService.createBookingRefund({ bookingId: 1, userId: '1' });

      expect(calculateBookingRefund).toHaveBeenCalled();
      expect(mockedCreatePaymentRefund).toHaveBeenCalledWith('123', 200);
    });
  });
});
