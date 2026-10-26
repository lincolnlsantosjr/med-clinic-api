import { z } from 'zod';
import { APPOINTMENT_STATUSES } from '../domain/types';
import { dateOnly, idCoerce, idNumber, pageQuery } from './common';

const isoWithZone = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2}(\.\d+)?)?(Z|[+-]\d{2}:\d{2})$/)
  .transform((s) => new Date(s))
  .refine((d) => !Number.isNaN(d.getTime()));

export const createAppointmentBody = z.object({
  doctorId: idNumber,
  patientId: idNumber,
  startsAt: isoWithZone,
});

export const statusBody = z.object({ status: z.enum(APPOINTMENT_STATUSES) });

export const appointmentListQuery = pageQuery
  .extend({
    doctorId: idCoerce.optional(),
    patientId: idCoerce.optional(),
    status: z.enum(APPOINTMENT_STATUSES).optional(),
    from: dateOnly.optional(),
    to: dateOnly.optional(),
  })
  .refine((q) => !q.from || !q.to || q.from <= q.to);

const DAY_MS = 86_400_000;
export const calendarQuery = z
  .object({ from: dateOnly, to: dateOnly })
  .refine(({ from, to }) => from <= to)
  .refine(({ from, to }) => (Date.parse(`${to}T00:00:00Z`) - Date.parse(`${from}T00:00:00Z`)) / DAY_MS <= 31);