import App from 'app';
import request from 'supertest';
import BookingController from './booking.controller';
import { mockCreateBooking } from './mocks/booking';
import AuthService from 'services/authService';
import axios from 'axios';

describe('Booking controller tests', () => {
  describe('POST /bookings', () => {
    it.only('should create a new booking', async () => {
      const bookingController = new BookingController();
      const app = new App([bookingController]);
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

      const authtoken = res.data.idToken as string;

      return request(app.getServer())
        .post(bookingController.path)
        .set({ authtoken, 'Content-Type': 'application/json' })
        .send(mockCreateBooking)
        .expect(200)
        .then((response) => {
          // Check the response data
          expect(response.body).toBeTruthy();
        });
    });
  });
});
