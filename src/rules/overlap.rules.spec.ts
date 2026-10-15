import { describe, expect, it } from 'vitest';
import { overlaps } from './overlap.rules';

describe('overlaps', () => {
  it('retorna true quando os períodos se sobrepõem', () => {
    const a = {
      start: new Date('2026-10-14T10:00:00'),
      end: new Date('2026-10-14T12:00:00'),
    };

    const b = {
      start: new Date('2026-10-14T11:00:00'),
      end: new Date('2026-10-14T13:00:00'),
    };

    expect(overlaps(a, b)).toBe(true);
  });

  it('retorna false quando os períodos não se sobrepõem', () => {
    const a = {
      start: new Date('2026-10-14T10:00:00'),
      end: new Date('2026-10-14T11:00:00'),
    };

    const b = {
      start: new Date('2026-10-14T12:00:00'),
      end: new Date('2026-10-14T13:00:00'),
    };

    expect(overlaps(a, b)).toBe(false);
  });

  it('retorna false quando um período termina exatamente quando o outro começa', () => {
    const a = {
      start: new Date('2026-10-14T10:00:00'),
      end: new Date('2026-10-14T11:00:00'),
    };

    const b = {
      start: new Date('2026-10-14T11:00:00'),
      end: new Date('2026-10-14T12:00:00'),
    };

    expect(overlaps(a, b)).toBe(false);
  });

  it('retorna true quando um período está inteiramente dentro do outro', () => {
    const a = {
      start: new Date('2026-10-14T10:00:00'),
      end: new Date('2026-10-14T14:00:00'),
    };

    const b = {
      start: new Date('2026-10-14T11:00:00'),
      end: new Date('2026-10-14T12:00:00'),
    };

    expect(overlaps(a, b)).toBe(true);
  });
});