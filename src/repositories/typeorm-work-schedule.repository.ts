import { DataSource } from 'typeorm';
import { WorkScheduleRepository } from '../domain/ports';
import { ShiftModel } from '../domain/types';
import { WorkShift } from '../entities/work-shift.entity';

const toShift = (s: ShiftModel): ShiftModel => ({
  weekDay: s.weekDay, startTime: s.startTime, endTime: s.endTime, slotDurationMinutes: s.slotDurationMinutes,
});

export class TypeormWorkScheduleRepository implements WorkScheduleRepository {
  constructor(private readonly ds: DataSource) {}

  async findByDoctor(doctorId: number): Promise<ShiftModel[]> {
    const rows = await this.ds.getRepository(WorkShift).find({ where: { doctorId }, order: { id: 'ASC' } });
    return rows.map(toShift);
  }

  async replace(doctorId: number, shifts: ShiftModel[]): Promise<ShiftModel[]> {
    const clean = shifts.map(toShift);
    await this.ds.transaction(async (manager) => {
      await manager.delete(WorkShift, { doctorId });
      if (clean.length > 0) await manager.insert(WorkShift, clean.map((s) => ({ ...s, doctorId })));
    });
    return clean;
  }
}