import { describe, expect, it } from 'vitest';
import { overlaps } from './overlap.rules';

const p = (s: string, e: string) => ({ start: new Date(`2026-10-13T${s}:00Z`), end: new Date(`2026-10-13T${e}:00Z`) });
const base = p('10:00', '10:30');

describe('overlaps', () => {
  it('um antes do outro', () => expect(overlaps(base, p('08:00', '09:00'))).toBe(false));
  it('um depois do outro', () => expect(overlaps(base, p('11:00', '12:00'))).toBe(false));
  it('encostados não conflitam', () => {
    expect(overlaps(base, p('10:30', '11:00'))).toBe(false);
    expect(overlaps(base, p('09:30', '10:00'))).toBe(false);
  });
  it('um dentro do outro', () => expect(overlaps(base, p('10:10', '10:20'))).toBe(true));
  it('cruzando a borda, com inícios diferentes', () => expect(overlaps(base, p('10:20', '10:50'))).toBe(true));
});