import App from 'app';
import BookingController from 'booking/booking.controller';
import FavoriteController from 'favorite/favorite.controller';
import StripeController from 'payments/stripe.controller';
import PropertyController from 'property/property.controller';
import UserController from 'user/user.controller';

const app = new App([
  new BookingController(),
  new StripeController(),
  new PropertyController(),
  new UserController(),
  new FavoriteController(),
]);
app.appListen();
