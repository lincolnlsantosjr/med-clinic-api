import { z } from 'zod';

const time = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/);

const shift = z
  .object({
    weekDay: z.number().int().min(0).max(6),
    startTime: time,
    endTime: time,
    slotDurationMinutes: z.number().int().positive(),
  })
  .refine((s) => s.startTime < s.endTime);

export const scheduleBody = z.object({ shifts: z.array(shift) });