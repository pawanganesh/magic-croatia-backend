import { eachDayOfInterval } from 'date-fns';

export const calculateBookingRefund = (
  bookingStartDate: Date,
  bookingPrice: number,
) => {
  const THIRTY_DAYS = 30;
  let amount: number;
  const daysCount = eachDayOfInterval({
    start: new Date(),
    end: new Date(bookingStartDate),
  });
  if (daysCount.length > THIRTY_DAYS) {
    amount = bookingPrice * 0.8;
  } else {
    amount = bookingPrice * 0.5;
  }
  return +parseFloat(amount.toString()).toFixed(2);
};

export const getStripePrice = (rawStripePrice: number) => {
  const parsedStripePrice = rawStripePrice * 100;
  const truncatedStripePrice = Math.trunc(parsedStripePrice);
  return truncatedStripePrice;
};
