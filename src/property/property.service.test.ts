import { PrismaClient } from '@prisma/client';
import { mockCreatedUser } from 'user/mocks/user';
import UserService from 'user/user.service';
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

  const mockedUserService = new (<new () => UserService>(
    UserService
  ))() as jest.Mocked<UserService>;

  const propertyService = new PropertyService(
    mockedPrismaClient,
    mockedUserService,
  );

  describe('Create property', () => {
    it('should throw when property already exists in my properties', async () => {
      propertyService.getUserProperties = jest
        .fn()
        .mockResolvedValue([{ name: 'My apartment' }]);

      const propertyData = { ...mockCreatePropertyDto, name: 'My apartment' };
      expect(
        propertyService.createProperty({ ...propertyData, userId: 10 }),
      ).rejects.toMatchObject({
        status: 400,
        message: 'Property name already exists!',
      });
    });

    it.skip('should throw when property is not created and not update user role to landlord', async () => {
      propertyService.getUserProperties = jest
        .fn()
        .mockResolvedValue(['My apartment']);
      const propertyData = {
        ...mockCreatePropertyDto,
        name: 'New apartment',
        userId: 100,
      };
      jest
        .spyOn(mockedPrismaClient.property, 'create')
        .mockResolvedValue(undefined);
      jest
        .spyOn(mockedPrismaClient.propertyExtras, 'create')
        .mockResolvedValue(undefined);
      jest.spyOn(mockedUserService, 'updateUserRoleToLandlord');

      expect(
        propertyService.createProperty(propertyData),
      ).rejects.toMatchObject({
        status: 500,
        message: 'Error while creating property!',
      });
      expect(mockedUserService.updateUserRoleToLandlord).not.toHaveBeenCalled();
    });

    it('should call create property method with correct params and update user role to landlord', async () => {
      propertyService.getUserProperties = jest
        .fn()
        .mockResolvedValue([{ name: 'My apartment' }]);
      const propertyData = {
        ...mockCreatePropertyDto,
        name: 'New apartment',
        userId: 100,
      };
      jest
        .spyOn(mockedPrismaClient.property, 'create')
        .mockResolvedValue(mockCreatedProperty);
      jest
        .spyOn(mockedPrismaClient.propertyExtras, 'create')
        .mockResolvedValue(mockPropertyExtras);

      jest
        .spyOn(mockedUserService, 'updateUserRoleToLandlord')
        .mockResolvedValue(mockCreatedUser);

      await propertyService.createProperty(propertyData);
      expect(mockedPrismaClient.property.create).toHaveBeenCalledWith({
        data: {
          ...propertyData,
        },
      });
      expect(mockedUserService.updateUserRoleToLandlord).toHaveBeenCalledWith(
        100,
      );
    });
  });
});
