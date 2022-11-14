import {
  differenceInCalendarDays,
  eachDayOfInterval,
  isEqual,
  sub,
} from "date-fns";
import {
  BookingCostInputs,
  FutureBookingsForProperty,
} from "./booking.interface";

export const getBookedDays = (
  futureBookings: FutureBookingsForProperty[] | undefined
) => {
  if (!futureBookings) return [];

  const bookedDays: Date[] = futureBookings
    .map((booking) => {
      const intervalDays = eachDayOfInterval({
        start: new Date(booking.startDate),
        end: sub(new Date(booking.endDate), { days: 1 }),
      });
      return intervalDays;
    })
    .flat();

  return bookedDays;
};

export const checkBookedInterval = (
  startDate: Date,
  endDate: Date,
  bookedDays: Date[]
) => {
  const intervalDays = eachDayOfInterval({
    start: new Date(startDate),
    end: sub(new Date(endDate), { days: 1 }),
  });

  const isInvalidBooking = intervalDays.some((day) =>
    bookedDays.find((bookedDay) => isEqual(bookedDay, day))
  );
  return !isInvalidBooking;
};

export const calculateBookingCost = (bookingData: BookingCostInputs) => {
  const { startDate, endDate, adultCount, childrenCount, pricePerNight } =
    bookingData;
  const totalNights = differenceInCalendarDays(startDate, endDate);

  const totalAdultsPrice =
    parseFloat(pricePerNight.toPrecision(2)) * totalNights * adultCount;
  const totalChildrenPrice =
    parseFloat(pricePerNight.toPrecision(2)) *
    0.8 *
    totalNights *
    childrenCount;

  const preliminaryCost = totalAdultsPrice + totalChildrenPrice;
  return preliminaryCost;
};
