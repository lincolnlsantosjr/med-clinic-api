import { z } from 'zod';

export const recordBody = z.object({ text: z.string().trim().min(1) });