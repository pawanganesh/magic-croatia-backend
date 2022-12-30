export type CreateUserDto = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  avatar?: string;
  uid: string;
};

export type PatchUserDto = {
  firstName: string;
  lastName: string;
  avatar: string | null;
};
