export interface StripeBooking {
  startDate: Date;
  endDate: Date;
  adultsCount: number;
  childrenCount: number;
  propertyId: number;
  userUuid: string;
}
