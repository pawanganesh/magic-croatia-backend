import { addDays } from 'date-fns';
import { calculateBookingRefund } from './payment.utils';

describe('Calculate booking refund correctly', () => {
  const BOOKING_PRICE = 1000.0;
  it('should refund 80% of booking price if booking is cancelled at least 30 days before booking start', () => {
    const FORTY_DAYS_BEFORE_BOOKING_START = new Date(addDays(new Date(), 40));
    const bookingRefundFortyDaysBeforeBooking = calculateBookingRefund(
      FORTY_DAYS_BEFORE_BOOKING_START,
      BOOKING_PRICE,
    );
    expect(bookingRefundFortyDaysBeforeBooking).toBe(800.0);

    const THORTY_DAYS_BEFORE_BOOKING_START = new Date(addDays(new Date(), 30));
    const bookingRefundThirtyDaysBeforeBooking = calculateBookingRefund(
      THORTY_DAYS_BEFORE_BOOKING_START,
      BOOKING_PRICE,
    );
    expect(bookingRefundThirtyDaysBeforeBooking).toBe(800.0);
  });

  it('should return 50% of booking price if booking is cancelled less than 30 days before booking', () => {
    const TWENTY_NINE_DAYS_BEFORE_BOOKING_START = new Date(
      addDays(new Date(), 29),
    );
    const bookingRefundFortyDaysBeforeBooking = calculateBookingRefund(
      TWENTY_NINE_DAYS_BEFORE_BOOKING_START,
      BOOKING_PRICE,
    );
    expect(bookingRefundFortyDaysBeforeBooking).toBe(500.0);
  });
});
