import { PrismaClient } from '@prisma/client';
import {
  mockCreatedProperty,
  mockCreatePropertyDto,
  mockPropertyExtras,
} from './mocks/property';
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

    // it('should throw when property is not created and not update user role to landlord', async () => {
    //   propertyService.getUserProperties = jest
    //     .fn()
    //     .mockResolvedValue(['My apartment']);
    //   const propertyData = {
    //     ...mockCreatePropertyDto,
    //     name: 'New apartment',
    //     userId: 100,
    //   };
    //   jest
    //     .spyOn(mockedPrismaClient.property, 'create')
    //     .mockResolvedValue(undefined);
    //   jest
    //     .spyOn(mockedPrismaClient.propertyExtras, 'create')
    //     .mockResolvedValue(undefined);
    //   jest.spyOn(mockedUserService, 'updateUserRoleToLandlord');

    //   expect(
    //     propertyService.createProperty(propertyData),
    //   ).rejects.toMatchObject({
    //     status: 500,
    //     message: 'Error while creating property!',
    //   });
    //   expect(mockedUserService.updateUserRoleToLandlord).not.toHaveBeenCalled();
    // });

    it.skip('should call create property method with correct params and update user role to landlord', async () => {
      propertyService.getUserProperties = jest
        .fn()
        .mockResolvedValue([{ name: 'My apartment' }]);
      const propertyData = {
        ...mockCreatePropertyDto,
        name: 'New apartment',
        userId: '100',
      };
      jest
        .spyOn(mockedPrismaClient.property, 'create')
        .mockResolvedValue(mockCreatedProperty);
      jest
        .spyOn(mockedPrismaClient.propertyExtras, 'create')
        .mockResolvedValue(mockPropertyExtras);

      await propertyService.createProperty(propertyData);
      expect(mockedPrismaClient.property.create).toHaveBeenCalledWith({
        data: {
          ...propertyData,
        },
      });
    });
  });
});
