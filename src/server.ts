import App from 'app';
import BookingController from 'booking/booking.controller';
import FavoriteController from 'favorite/favorite.controller';
import StripeController from 'payments/stripe.controller';
import PropertyController from 'property/property.controller';
import ReviewController from 'review/review.controller';
import UserController from 'user/user.controller';

const app = new App([
  new BookingController(),
  new FavoriteController(),
  new PropertyController(),
  new ReviewController(),
  new StripeController(),
  new UserController(),
]);
app.appListen();
