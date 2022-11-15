import BookingService from "./booking.service";
import { PrismaClient } from "@prisma/client";
import { addDays } from "date-fns";
import PropertyService from "property/property.service";
import { mockBookingData } from "./mocks/booking";

(PrismaClient as any) = jest.fn();

describe("Booking service tests", () => {
  const mockedPropertyService = new (<new () => PropertyService>(
    PropertyService
  ))() as jest.Mocked<PropertyService>;

  (PrismaClient as any) = jest.fn();
  const bookingService = new BookingService(mockedPropertyService);
  bookingService.getFutureBookingsForProperty = jest.fn().mockResolvedValue([]);
  const today = new Date();

  describe("Create booking", () => {
    it("should throw when start date is before tomorrow's date", async () => {
      let bookingData = { ...mockBookingData, startDate: today };
      expect(bookingService.createBooking(bookingData)).rejects.toMatchObject({
        message: "Invalid start date!",
        status: 400,
      });
    });

    it("should throw when end date is before start date", async () => {
      let bookingData = {
        ...mockBookingData,
        endDate: mockBookingData.startDate,
      };
      expect(bookingService.createBooking(bookingData)).rejects.toMatchObject({
        message: "Invalid end date!",
        status: 400,
      });
    });

    it("should throw when booking date range in already booked range", async () => {
      let bookingData = {
        ...mockBookingData,
        startDate: addDays(today, 3),
        endDate: addDays(today, 5),
      };
      bookingService.getFutureBookingsForProperty = jest
        .fn()
        .mockResolvedValue([
          { id: 1, startDate: addDays(today, 2), endDate: addDays(today, 4) },
        ]);

      expect(bookingService.createBooking(bookingData)).rejects.toMatchObject({
        message: "Chosen dates for this property are not available!",
        status: 400,
      });
    });
  });
});
