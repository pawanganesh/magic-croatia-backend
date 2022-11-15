export type CreateUserDto = {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  avatar?: string;
  uuid: string;
};