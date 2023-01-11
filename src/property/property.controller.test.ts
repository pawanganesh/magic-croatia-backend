import App from 'app';
import AuthService from 'services/authService';
import request from 'supertest';
import PropertyController from './property.controller';
import axios from 'axios';
import { mockCreatePropertyDto } from './mocks/property';
import crypto from 'crypto';
import PrismaService from 'services/prismaService';
import { Role } from '@prisma/client';

jest.setTimeout(30000);

describe('Property controller tests', () => {
  describe('POST /properties', () => {
    let app: App;
    let propertyController: PropertyController;
    let authtoken: string;

    beforeAll(async () => {
      propertyController = new PropertyController();
      app = new App([propertyController]);
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
      await PrismaService.getPrisma().user.update({
        where: {
          id: 'Kdo1JqpEdWhmw85v1eD8zL5g5kv2',
        },
        data: {
          role: Role.CUSTOMER,
        },
      });
    });

    it('should create new property and set user role to landlord', async () => {
      const propertyData = {
        ...mockCreatePropertyDto,
        name: crypto.randomUUID().toString(),
        propertyExtras: {
          wifi: true,
          pool: true,
          airCondition: true,
          pets: true,
          freeParking: true,
        },
      };

      return request(app.getServer())
        .post(propertyController.path)
        .set({ authtoken, 'Content-Type': 'application/json' })
        .send(propertyData)
        .expect(200)
        .then(async (response) => {
          // Check the response data
          expect(response.body).toBeTruthy();
          const updatedUser = await PrismaService.getPrisma().user.findFirst({
            where: {
              id: 'Kdo1JqpEdWhmw85v1eD8zL5g5kv2',
            },
          });
          expect(updatedUser.role).toBe(Role.LANDLORD);
        });
    });
  });
});
