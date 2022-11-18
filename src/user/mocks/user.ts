import { User } from '@prisma/client';

export const mockCreatedUser: User = {
  id: 1,
  uuid: '10abc',
  avatar: null,
  createdAt: new Date('2022-11-15T12:03:17.630Z'),
  updatedAt: new Date('2022-11-15T12:03:17.630Z'),
  email: 'john@prisma.io',
  password: '123456',
  firstName: 'John',
  lastName: 'Halving',
  role: 'CUSTOMER',
};
