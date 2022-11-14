import BookingService from "./booking.service";
import { Prisma, PrismaClient } from "@prisma/client";
import { CreateBookingDto } from "./booking.interface";
import { addDays, subDays } from "date-fns";
import PropertyService from "property/property.service";
import HttpException from "exceptions/HttpException";
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
      let bookingData = { ...mockBookingData, startDate: subDays(today, 1) };
      try {
        await bookingService.createBooking(bookingData);
      } catch (err) {
        expect(err).toBeInstanceOf(HttpException);
        expect(err).toMatchObject({
          message: "Invalid start date!",
          status: 400,
        });
      }
    });

    it("should throw when start date today's date", async () => {
      let bookingData = { ...mockBookingData, startDate: today };
      try {
        await bookingService.createBooking(bookingData);
      } catch (err) {
        expect(err).toBeInstanceOf(HttpException);
        expect(err).toMatchObject({
          message: "Invalid start date!",
          status: 400,
        });
      }
    });

    it("should throw when end date is before start date", async () => {
      let bookingData = {
        ...mockBookingData,
        endDate: subDays(mockBookingData.startDate, 1),
      };

      try {
        await bookingService.createBooking(bookingData);
      } catch (err) {
        expect(err).toBeInstanceOf(HttpException);
        expect(err).toMatchObject({
          message: "Invalid end date!",
          status: 400,
        });
      }
    });

    it("should throw when end date is equal start date", async () => {
      let bookingData = {
        ...mockBookingData,
        endDate: mockBookingData.startDate,
      };

      try {
        await bookingService.createBooking(bookingData);
      } catch (err) {
        expect(err).toBeInstanceOf(HttpException);
        expect(err).toMatchObject({
          message: "Invalid end date!",
          status: 400,
        });
      }
    });
  });
});
