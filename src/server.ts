import App from "app";
import BookingController from "booking/booking.controller";

const app = new App([new BookingController()]);
app.appListen();
