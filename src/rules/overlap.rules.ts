export interface Period { start: Date; end: Date }

export function overlaps(a: Period, b: Period): boolean {
  return a.start.getTime() < b.end.getTime() && b.start.getTime() < a.end.getTime();
}