import { PrismaClient } from '@prisma/client';
import { mockCreatedProperty, mockCreatePropertyDto } from './mocks/property';
import PropertyService from './property.service';

describe('Booking service tests', () => {
  const mockedPrismaClient = new (<new () => PrismaClient>(
    PrismaClient
  ))() as jest.Mocked<PrismaClient>;

  const propertyService = new PropertyService(mockedPrismaClient);

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
