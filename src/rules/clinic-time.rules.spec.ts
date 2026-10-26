
import { describe, expect, it } from 'vitest';
import {
  clinicDayEnd,
  clinicDayStart,
  timeToMinutes,
  toClinicLocal,
} from './clinic-time.rules';

describe('toClinicLocal', () => {
  it('converte a data para o dia da semana e horário de São Paulo', () => {
    const date = new Date('2026-10-26T12:30:00.000Z');

    expect(toClinicLocal(date)).toEqual({
      weekDay: 1,
      minutes: 570,
    });
  });

  it('converte corretamente um horário próximo da meia-noite', () => {
    const date = new Date('2026-10-26T02:45:00.000Z');

    expect(toClinicLocal(date)).toEqual({
      weekDay: 0,
      minutes: 1425,
    });
  });
});

describe('timeToMinutes', () => {
  it('converte um horário para minutos desde a meia-noite', () => {
    expect(timeToMinutes('08:30')).toBe(510);
  });

  it('converte meia-noite', () => {
    expect(timeToMinutes('00:00')).toBe(0);
  });

  it('converte o último minuto do dia', () => {
    expect(timeToMinutes('23:59')).toBe(1439);
  });
});

describe('clinicDayStart', () => {
  it('retorna o início do dia no fuso de São Paulo', () => {
    expect(clinicDayStart('2026-10-26').toISOString())
      .toBe('2026-10-26T03:00:00.000Z');
  });
});

describe('clinicDayEnd', () => {
  it('retorna o final do dia no fuso de São Paulo', () => {
    expect(clinicDayEnd('2026-10-26').toISOString())
      .toBe('2026-10-27T02:59:59.999Z');
  });
});
