import { z } from 'zod';

export const createPatientBody = z.object({
  name: z.string().trim().min(1),
  cpf: z.string().regex(/^\d{11}$/),
});

export const updatePatientBody = z.object({ name: z.string().trim().min(1).optional() });