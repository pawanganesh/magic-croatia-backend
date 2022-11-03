import App from "app";
import BookingController from "booking/booking.controller";
import StripeController from "payments/stripe.controller";

const app = new App([new BookingController(), new StripeController()]);
app.appListen();
