
import { describe, expect, it } from 'vitest';
import type { ShiftModel } from '../domain/types';
import {
  findSlotShift,
  hasOverlappingShifts,
} from './schedule.rules';

const shift = (
  weekDay: number,
  startTime: string,
  endTime: string,
  slotDurationMinutes = 30,
): ShiftModel => ({
  weekDay,
  startTime,
  endTime,
  slotDurationMinutes,
});

describe('hasOverlappingShifts', () => {
  it('retorna false quando a lista está vazia', () => {
    expect(hasOverlappingShifts([])).toBe(false);
  });

  it('retorna false quando existe apenas um turno', () => {
    expect(
      hasOverlappingShifts([shift(1, '08:00', '12:00')]),
    ).toBe(false);
  });

  it('retorna true quando dois turnos do mesmo dia se sobrepõem', () => {
    expect(
      hasOverlappingShifts([
        shift(1, '08:00', '12:00'),
        shift(1, '11:00', '15:00'),
      ]),
    ).toBe(true);
  });

  it('retorna false quando os turnos apenas encostam', () => {
    expect(
      hasOverlappingShifts([
        shift(1, '08:00', '12:00'),
        shift(1, '12:00', '16:00'),
      ]),
    ).toBe(false);
  });

  it('retorna false quando os horários coincidem, mas os dias são diferentes', () => {
    expect(
      hasOverlappingShifts([
        shift(1, '08:00', '12:00'),
        shift(2, '08:00', '12:00'),
      ]),
    ).toBe(false);
  });

  it('retorna false quando um turno termina antes de o outro começar', () => {
    expect(
      hasOverlappingShifts([
        shift(1, '08:00', '10:00'),
        shift(1, '11:00', '13:00'),
      ]),
    ).toBe(false);
  });

  it('identifica sobreposição entre turnos mesmo quando está no final da lista', () => {
    expect(
      hasOverlappingShifts([
        shift(1, '08:00', '09:00'),
        shift(1, '10:00', '11:00'),
        shift(1, '10:30', '12:00'),
      ]),
    ).toBe(true);
  });
});

describe('findSlotShift', () => {
  // 09:30 de segunda-feira em São Paulo.
  const appointmentStart = new Date('2026-10-26T12:30:00.000Z');

  it('retorna o turno quando o horário cabe exatamente nele', () => {
    const morningShift = shift(1, '09:00', '10:00');

    expect(
      findSlotShift([morningShift], appointmentStart),
    ).toEqual(morningShift);
  });

  it('retorna null quando não existem turnos', () => {
    expect(findSlotShift([], appointmentStart)).toBeNull();
  });

  it('retorna null quando o turno é de outro dia da semana', () => {
    expect(
      findSlotShift([shift(2, '09:00', '10:00')], appointmentStart),
    ).toBeNull();
  });

  it('retorna null quando o horário é anterior ao início do turno', () => {
    expect(
      findSlotShift([shift(1, '10:00', '12:00')], appointmentStart),
    ).toBeNull();
  });

  it('retorna null quando o horário não está alinhado à duração do slot', () => {
    // 09:30 não é múltiplo de 30 minutos a partir de 09:15.
    expect(
      findSlotShift(
        [shift(1, '09:15', '10:15')],
        appointmentStart,
      ),
    ).toBeNull();
  });

  it('retorna null quando o atendimento ultrapassa o fim do turno', () => {
    // O atendimento começa às 09:30 e terminaria às 10:00,
    // mas o turno termina às 09:45.
    expect(
      findSlotShift(
        [shift(1, '09:00', '09:45')],
        appointmentStart,
      ),
    ).toBeNull();
  });

  it('encontra um turno válido depois de ignorar um turno incompatível', () => {
    const validShift = shift(1, '09:00', '10:00');

    expect(
      findSlotShift(
        [shift(2, '09:00', '10:00'), validShift],
        appointmentStart,
      ),
    ).toEqual(validShift);
  });
});
