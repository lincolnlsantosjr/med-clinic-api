import { z } from 'zod';

export const createDoctorBody = z.object({
  name: z.string().trim().min(1),
  email: z.string().trim().toLowerCase().email(),
  password: z.string().min(8),
  crm: z.string().trim().min(1),
});