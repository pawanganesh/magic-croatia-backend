import PaymentService from 'payment/payment.service';

export const createBookingRefundMocks = (paymentService: PaymentService) => {
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

  return {
    mockFindBookingForRefund,
    mockCreatePaymentRefund,
    mockUpdateBookingWithRefundId,
  };
};
