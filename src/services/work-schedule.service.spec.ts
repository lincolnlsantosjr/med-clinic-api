import { describe, expect, it, vi } from 'vitest';
import { ShiftModel } from '../domain/types';
import { WorkScheduleService } from './work-schedule.service';

const shift = (weekDay: number, startTime: string, endTime: string): ShiftModel => ({
  weekDay, startTime, endTime, slotDurationMinutes: 30,
});

function build(doctor: unknown = { id: 3 }) {
  const doctors = { findById: vi.fn().mockResolvedValue(doctor), findByCrm: vi.fn(), findByUserId: vi.fn(), createWithUser: vi.fn(), findPage: vi.fn() };
  const schedules = { findByDoctor: vi.fn().mockResolvedValue([]), replace: vi.fn(async (_id: number, s: ShiftModel[]) => s) };
  return { service: new WorkScheduleService(doctors, schedules), schedules };
}

describe('WorkScheduleService', () => {
  it('rejeita turnos sobrepostos no mesmo dia', async () => {
    const { service, schedules } = build();
    await expect(service.replace(3, [shift(2, '08:00', '12:00'), shift(2, '11:00', '15:00')]))
      .rejects.toMatchObject({ code: 'DADOS_INVALIDOS' });
    expect(schedules.replace).not.toHaveBeenCalled();
  });

  it('aceita turnos encostados', async () => {
    const { service } = build();
    const shifts = [shift(2, '08:00', '12:00'), shift(2, '12:00', '18:00')];
    await expect(service.replace(3, shifts)).resolves.toEqual({ shifts });
  });

  it('aceita turnos no mesmo horário em dias diferentes', async () => {
    const { service } = build();
    await expect(service.replace(3, [shift(2, '08:00', '12:00'), shift(4, '08:00', '12:00')])).resolves.toBeDefined();
  });

  it('lista vazia deixa o médico sem escala', async () => {
    const { service, schedules } = build();
    await expect(service.replace(3, [])).resolves.toEqual({ shifts: [] });
    expect(schedules.replace).toHaveBeenCalledWith(3, []);
  });

  it('devolve 404 para médico inexistente', async () => {
    const { service } = build(null);
    await expect(service.get(99)).rejects.toMatchObject({ code: 'RECURSO_NAO_ENCONTRADO' });
  });

  it('get devolve a escala atual', async () => {
    const { service } = build();
    await expect(service.get(3)).resolves.toEqual({ shifts: [] });
  });
});