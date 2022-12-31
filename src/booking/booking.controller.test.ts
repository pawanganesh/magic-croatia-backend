import App from 'app';
import request from 'supertest';
import BookingController from './booking.controller';
import AuthService from 'services/authService';
import axios from 'axios';
import PrismaService from 'services/prismaService';
import { mockCreatePropertyDto } from 'property/mocks/property';
import { Prisma } from '@prisma/client';
import { addDays } from 'date-fns';

jest.setTimeout(30000);

describe('Booking controller tests', () => {
  describe('POST /bookings', () => {
    let app: App;
    let bookingController: BookingController;
    let authtoken: string;

    afterEach(async () => {
      await PrismaService.getPrisma().booking.deleteMany();
      await PrismaService.getPrisma().propertyExtras.deleteMany();
      await PrismaService.getPrisma().property.deleteMany();
    });

    beforeEach(async () => {
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
    it.only('should create a new booking', async () => {
      const createdProperty = await PrismaService.getPrisma().property.create({
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
        })
        .expect(200)
        .then((response) => {
          // Check the response data
          expect(response.body).toBeTruthy();
        });
    });
  });
});
