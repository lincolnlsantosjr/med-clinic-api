import { DoctorRepository, WorkScheduleRepository } from '../domain/ports';
import { ShiftModel } from '../domain/types';
import { AppError, notFound } from '../errors/app-error';
import { hasOverlappingShifts } from '../rules/schedule.rules';

export class WorkScheduleService {
  constructor(
    private readonly doctors: DoctorRepository,
    private readonly schedules: WorkScheduleRepository,
  ) {}

  async get(doctorId: number): Promise<{ shifts: ShiftModel[] }> {
    await this.ensureDoctor(doctorId);
    return { shifts: await this.schedules.findByDoctor(doctorId) };
  }

  async replace(doctorId: number, shifts: ShiftModel[]): Promise<{ shifts: ShiftModel[] }> {
    await this.ensureDoctor(doctorId);
    if (hasOverlappingShifts(shifts)) {
      throw new AppError('DADOS_INVALIDOS', 'Há turnos sobrepostos no mesmo dia da semana.');
    }
    return { shifts: await this.schedules.replace(doctorId, shifts) };
  }

  private async ensureDoctor(doctorId: number): Promise<void> {
    if (!(await this.doctors.findById(doctorId))) throw notFound('Médico');
  }
}