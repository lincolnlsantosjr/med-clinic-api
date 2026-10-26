const CLINIC_TIME_ZONE = 'America/Sao_Paulo';
const CLINIC_UTC_OFFSET = '-03:00';

const WEEKDAY_INDEX: Record<string, number> = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };

const formatter = new Intl.DateTimeFormat('en-US', {
  timeZone: CLINIC_TIME_ZONE, weekday: 'short', hour: '2-digit', minute: '2-digit', hourCycle: 'h23',
});

export function toClinicLocal(date: Date): { weekDay: number; minutes: number } {
  const parts = formatter.formatToParts(date);
  const read = (type: string): string => parts.filter((p) => p.type === type).map((p) => p.value).join('');
  return { weekDay: WEEKDAY_INDEX[read('weekday')], minutes: Number(read('hour')) * 60 + Number(read('minute')) };
}

export function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
}

export const clinicDayStart = (date: string): Date => new Date(`${date}T00:00:00.000${CLINIC_UTC_OFFSET}`);
export const clinicDayEnd = (date: string): Date => new Date(`${date}T23:59:59.999${CLINIC_UTC_OFFSET}`);