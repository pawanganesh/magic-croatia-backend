import { PrismaClient } from '@prisma/client';
import { mockCreatePropertyDto } from './mocks/property';
import PropertyService from './property.service';

describe('Property service tests', () => {
  const mockedPrismaClient = new (<new () => PrismaClient>(
    PrismaClient
  ))() as jest.Mocked<PrismaClient>;

  const propertyService = new PropertyService(mockedPrismaClient);

  describe('Create property', () => {
    it('should throw when property already exists in my properties', async () => {
      propertyService.getUserProperties = jest
        .fn()
        .mockResolvedValue([{ name: 'My apartment' }]);

      const propertyData = { ...mockCreatePropertyDto, name: 'My apartment' };
      expect(
        propertyService.createProperty({ ...propertyData, userId: '10' }),
      ).rejects.toMatchObject({
        status: 400,
        message: 'Property name already exists!',
      });
    });
  });
});
