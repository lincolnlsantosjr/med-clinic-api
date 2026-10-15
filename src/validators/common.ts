import { z } from 'zod';

export const idCoerce = z.coerce.number().int().positive().max(2_147_483_647);
export const idParams = z.object({ id: idCoerce });
export const idNumber = z.number().int().positive().max(2_147_483_647);

export const pageQuery = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
});

export const nameListQuery = pageQuery.extend({ name: z.string().trim().optional() });

const isRealDate = (s: string): boolean => {
  const d = new Date(`${s}T00:00:00Z`);
  return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === s;
};
export const dateOnly = z.string().regex(/^\d{4}-\d{2}-\d{2}$/).refine(isRealDate);