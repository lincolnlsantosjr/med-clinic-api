import { z } from 'zod';
import { ROLES } from '../domain/types';

export const loginBody = z.object({
  email: z.string().trim().toLowerCase().min(1),
  password: z.string().min(1),
});

export const createUserBody = z.object({
  name: z.string().trim().min(1),
  email: z.string().trim().toLowerCase().email(),
  password: z.string().min(8),
  roles: z.array(z.enum(ROLES)).min(1),
});