import App from 'app';
import request from 'supertest';
import BookingController from './booking.controller';
import AuthService from 'services/authService';
import axios from 'axios';
import PrismaService from 'services/prismaService';
import { mockCreatePropertyDto } from 'property/mocks/property';
import { Booking, Prisma, Property } from '@prisma/client';
import { addDays } from 'date-fns';

jest.setTimeout(30000);

describe('Booking controller tests', () => {
  describe('POST /bookings', () => {
    let app: App;
    let bookingController: BookingController;
    let authtoken: string;
    let createdProperty: Property;
    let createdBooking: Booking;

    afterEach(async () => {
      if (createdBooking) {
        await PrismaService.getPrisma().booking.delete({
          where: {
            id: createdBooking.id,
          },
        });
      }

      await PrismaService.getPrisma().propertyExtras.deleteMany({
        where: {
          propertyId: createdProperty.id,
        },
      });
      await PrismaService.getPrisma().property.delete({
        where: {
          id: createdProperty.id,
        },
      });
    });

    beforeAll(async () => {
      bookingController = new BookingController();
      app = new App([bookingController]);
      const customToken = await AuthService.admin
        .auth()
        .createCustomToken('Kdo1JqpEdWhmw85v1eD8zL5g5kv2');

      const res = await axios.post(
        `https://www.googleapis.com/identitytoolkit/v3/relyingparty/verifyCustomToken?key=${process.env.FIREBASE_API_KEY}`,
        {
          token: customToken,
          returnSecureToken: true,
        },
      );
      authtoken = res.data.idToken as string;
    });

    beforeEach(async () => {
      createdProperty = await PrismaService.getPrisma().property.create({
        data: {
          ...mockCreatePropertyDto,
          propertyExtras: {
            create: {
              ...mockCreatePropertyDto.propertyExtras,
            },
          },
          userId: 'Kdo1JqpEdWhmw85v1eD8zL5g5kv2',
        },
      });

      createdBooking = undefined;
    });

    it('should throw when endDate in not supplied in request body', async () => {
      return request(app.getServer())
        .post(bookingController.path)
        .set({ authtoken, 'Content-Type': 'application/json' })
        .send({
          totalPrice: new Prisma.Decimal(3999.81),
          adultsCount: createdProperty.persons,
          childrenCount: 0,
          startDate: new Date(addDays(new Date(), 10)),
          propertyId: createdProperty.id,
          paymentIntentId: '123',
        })
        .expect(400)
        .then((response) => {
          // Check the response data
          expect(response.body.message).toBe('Provide valid end date');
        });
    });

    it('should throw when totalPrice do not match', async () => {
      return request(app.getServer())
        .post(bookingController.path)
        .set({ authtoken, 'Content-Type': 'application/json' })
        .send({
          totalPrice: new Prisma.Decimal(3999.81),
          adultsCount: createdProperty.persons,
          childrenCount: 0,
          startDate: new Date(addDays(new Date(), 10)),
          endDate: new Date(addDays(new Date(), 15)),
          propertyId: createdProperty.id,
          paymentIntentId: '123',
        })
        .expect(400)
        .then((response) => {
          // Check the response data
          expect(response.body.message).toBe(
            'Calculated price is not the same!',
          );
        });
    });

    it('should create a new booking', async () => {
      return request(app.getServer())
        .post(bookingController.path)
        .set({ authtoken, 'Content-Type': 'application/json' })
        .send({
          totalPrice: new Prisma.Decimal(3999.8),
          adultsCount: createdProperty.persons,
          childrenCount: 0,
          startDate: new Date(addDays(new Date(), 10)),
          endDate: new Date(addDays(new Date(), 15)),
          propertyId: createdProperty.id,
          paymentIntentId: '123',
        })
        .expect(200)
        .then((response) => {
          // Check the response data
          createdBooking = response.body;
          expect(response.body).toBeTruthy();
        });
    });
  });
});
