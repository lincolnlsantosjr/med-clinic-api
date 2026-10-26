import { ShiftModel } from '../domain/types';
import { timeToMinutes, toClinicLocal } from './clinic-time.rules';

export function hasOverlappingShifts(shifts: ShiftModel[]): boolean {
  return shifts.some((a, i) =>
    shifts.slice(i + 1).some(
      (b) =>
        a.weekDay === b.weekDay &&
        timeToMinutes(a.startTime) < timeToMinutes(b.endTime) &&
        timeToMinutes(b.startTime) < timeToMinutes(a.endTime),
    ),
  );
}

export function findSlotShift(shifts: ShiftModel[], startsAt: Date): ShiftModel | null {
  const { weekDay, minutes } = toClinicLocal(startsAt);
  return (
    shifts.find((s) => {
      const start = timeToMinutes(s.startTime);
      const end = timeToMinutes(s.endTime);
      return (
        s.weekDay === weekDay &&
        minutes >= start &&
        (minutes - start) % s.slotDurationMinutes === 0 &&
        minutes + s.slotDurationMinutes <= end
      );
    }) ?? null
  );
}