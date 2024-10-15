import { z } from 'zod';

export const UserCreateSchema = z.object({
  authUserId: z.string(),
  email: z.string().email(),
  name: z.string(),
  address: z.string().optional(),
  phone: z.string().optional(),
});

export const UserUpdateSchema = UserCreateSchema.omit({
  authUserId: true,
}).partial();
