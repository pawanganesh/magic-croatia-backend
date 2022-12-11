import { Prisma } from '@prisma/client';
import {
  differenceInCalendarDays,
  eachDayOfInterval,
  isEqual,
  subDays,
} from 'date-fns';
import {
  BookingCostInputs,
  FutureBookingsForProperty,
} from './booking.interface';

export const getBookedDays = (
  futureBookings: FutureBookingsForProperty[] | undefined,
) => {
  if (!futureBookings) return [];

  const bookedDays: Date[] = futureBookings
    .map((booking) => {
      const formattedStartDate = new Date(booking.startDate).toDateString();
      const formattedEndDate = new Date(booking.endDate).toDateString();

      const intervalDays = eachDayOfInterval({
        start: new Date(formattedStartDate),
        end: subDays(new Date(formattedEndDate), 1),
      });

      return intervalDays;
    })
    .flat();

  return bookedDays;
};

export const checkBookedInterval = (
  startDate: Date,
  endDate: Date,
  bookedDays: Date[],
) => {
  const intervalDays = eachDayOfInterval({
    start: startDate,
    end: endDate,
  });

  const isInvalidBooking = intervalDays.some((day) =>
    bookedDays.find((bookedDay) => isEqual(bookedDay, day)),
  );
  return !isInvalidBooking;
};

export const calculateBookingCost = (
  bookingData: BookingCostInputs,
): Prisma.Decimal => {
  const { startDate, endDate, adultsCount, childrenCount, pricePerNight } =
    bookingData;
  const totalNights = differenceInCalendarDays(endDate, startDate);

  const totalAdultsPrice =
    parseFloat(pricePerNight.toString()) * totalNights * adultsCount;

  const totalChildrenPrice =
    parseFloat(pricePerNight.toFixed(2)) * 0.8 * totalNights * childrenCount;

  const preliminaryCost = totalAdultsPrice + totalChildrenPrice;
  return new Prisma.Decimal(parseFloat(preliminaryCost.toFixed(2)));
};
