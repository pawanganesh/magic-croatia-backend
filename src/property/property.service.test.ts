import { Prisma, PrismaClient, Property } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime';
import { mockCreatedProperty, mockCreatePropertyDto } from './mocks/property';
import PropertyService from './property.service';

describe('Booking service tests', () => {
  const mockedPrismaClient = new (<new () => PrismaClient>(
    PrismaClient
  ))() as jest.Mocked<PrismaClient>;

  const propertyService = new PropertyService(mockedPrismaClient);

  describe('Calculate property average rating', () => {
    it('should return correct average rating', async () => {
      jest.spyOn(mockedPrismaClient.property, 'findFirst').mockResolvedValue({
        ...mockCreatedProperty,
        bookings: [
          { rating: new Prisma.Decimal(2.5) },
          { rating: new Prisma.Decimal(4.0) },
          { rating: new Prisma.Decimal(5.0) },
        ],
      } as Property & {
        bookings: {
          rating: Decimal;
        }[];
      });

      jest
        .spyOn(mockedPrismaClient.property, 'update')
        .mockResolvedValue(mockCreatedProperty);

      const propertyId = 1;
      await propertyService.calculatePropertyAverageRating(propertyId);

      expect(mockedPrismaClient.property.update).toHaveBeenCalledWith({
        where: { id: propertyId },
        data: {
          averageRating: 3.83,
          numberOfReviews: 3,
        },
      });
    });
  });

  describe('Create property', () => {
    it('should throw when property already exists in my properties', async () => {
      propertyService.getMyPropertyNames = jest
        .fn()
        .mockResolvedValue(['My apartment']);

      const propertyData = { ...mockCreatePropertyDto, name: 'My apartment' };
      expect(
        propertyService.createProperty(propertyData),
      ).rejects.toMatchObject({
        status: 400,
        message: 'Property name already exists!',
      });
    });

    it('should call create property method with correct params', async () => {
      propertyService.getMyPropertyNames = jest
        .fn()
        .mockResolvedValue(['My apartment']);

      const propertyData = { ...mockCreatePropertyDto, name: 'New apartment' };
      jest
        .spyOn(mockedPrismaClient.property, 'create')
        .mockResolvedValue(mockCreatedProperty);

      await propertyService.createProperty(propertyData);

      expect(mockedPrismaClient.property.create).toHaveBeenCalledWith({
        data: {
          ...propertyData,
        },
      });
    });
  });
});
