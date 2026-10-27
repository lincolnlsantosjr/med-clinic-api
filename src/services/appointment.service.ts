import {
  AppointmentRepository, AppointmentTransactionRunner, DoctorRepository, PatientRepository, WorkScheduleRepository,
} from '../domain/ports';
import { Actor, AppointmentModel, AppointmentStatus, PageQuery, Paginated, ShiftModel } from '../domain/types';
import { AppError, notFound } from '../errors/app-error';
import { clinicDayEnd, clinicDayStart } from '../rules/clinic-time.rules';
import { findSlotShift } from '../rules/schedule.rules';
import { paginate } from '../shared/pagination';

export interface AppointmentListInput extends PageQuery {
  doctorId?: number; patientId?: number; status?: AppointmentStatus; from?: string; to?: string;
}

type Who = 'admin' | 'secretary' | 'owner';

const TRANSITIONS: Record<AppointmentStatus, Partial<Record<AppointmentStatus, readonly Who[]>>> = {
  scheduled: { in_progress: ['owner', 'admin'], cancelled: ['admin', 'secretary', 'owner'] },
  in_progress: { done: ['owner', 'admin'], cancelled: ['admin', 'owner'] },
  done: {},
  cancelled: {},
};

export class AppointmentService {
  constructor(
    private readonly appointments: AppointmentRepository,
    private readonly doctors: DoctorRepository,
    private readonly patients: PatientRepository,
    private readonly schedules: WorkScheduleRepository,
    private readonly transactions: AppointmentTransactionRunner,
  ) {}

  async create(input: { doctorId: number; patientId: number; startsAt: Date }): Promise<AppointmentModel> {
    const doctor = await this.doctors.findById(input.doctorId);
    if (!doctor) throw notFound('Médico');
    const patient = await this.patients.findById(input.patientId);
    if (!patient) throw notFound('Paciente');

    const shifts = await this.schedules.findByDoctor(doctor.id);
    const shift = input.startsAt.getTime() % 60_000 === 0 ? findSlotShift(shifts, input.startsAt) : null;
    if (!shift) throw new AppError('HORARIO_FORA_DA_ESCALA', 'Este horário não existe na escala do médico.');

    const endsAt = new Date(input.startsAt.getTime() + shift.slotDurationMinutes * 60_000);
    const period = { start: input.startsAt, end: endsAt };

    return this.transactions.run(async (tx) => {
      if (await tx.hasDoctorConflict(doctor.id, period)) {
        throw new AppError('HORARIO_INDISPONIVEL', 'Este horário acabou de ser ocupado.');
      }
      if (await tx.hasPatientConflict(patient.id, period)) {
        throw new AppError('PACIENTE_INDISPONIVEL', 'O paciente já tem consulta neste período.');
      }
      return tx.create({ doctorId: doctor.id, patientId: patient.id, startsAt: input.startsAt, endsAt });
    });
  }

  async getById(id: number, actor: Actor): Promise<AppointmentModel> {
    const appointment = await this.appointments.findById(id);
    if (!appointment) throw notFound('Agendamento');
    if (this.isRestrictedDoctor(actor) && !(await this.isOwner(actor, appointment.doctorId))) {
      throw new AppError('ACESSO_NEGADO', 'Agendamento de outro médico.');
    }
    return appointment;
  }

  async list(input: AppointmentListInput, actor: Actor): Promise<Paginated<AppointmentModel>> {
    let doctorId = input.doctorId;
    if (this.isRestrictedDoctor(actor)) {
      const me = await this.doctors.findByUserId(actor.userId);
      if (!me) return paginate({ items: [], total: 0 }, input);
      doctorId = me.id;
    }
    const result = await this.appointments.findPage({
      ...input,
      doctorId,
      from: input.from ? clinicDayStart(input.from) : undefined,
      to: input.to ? clinicDayEnd(input.to) : undefined,
    });
    return paginate(result, input);
  }

  async calendar(doctorId: number, from: string, to: string): Promise<{ shifts: ShiftModel[]; appointments: AppointmentModel[] }> {
    if (!(await this.doctors.findById(doctorId))) throw notFound('Médico');
    const shifts = await this.schedules.findByDoctor(doctorId);
    const appointments = await this.appointments.findActiveInRange(doctorId, clinicDayStart(from), clinicDayEnd(to));
    return { shifts, appointments };
  }

  private isRestrictedDoctor(actor: Actor): boolean {
    return actor.roles.includes('doctor') && !actor.roles.includes('admin');
  }

  private async isOwner(actor: Actor, doctorId: number): Promise<boolean> {
    if (!actor.roles.includes('doctor')) return false;
    return (await this.doctors.findByUserId(actor.userId))?.id === doctorId;
  }

  async changeStatus(id: number, next: AppointmentStatus, actor: Actor): Promise<AppointmentModel> {
  const appointment = await this.appointments.findById(id);
  if (!appointment) throw notFound('Agendamento');

  const allowed = TRANSITIONS[appointment.status][next];
  if (!allowed) throw new AppError('TRANSICAO_INVALIDA', `Não é possível ir de ${appointment.status} para ${next}.`);

  const who: Who[] = [];
  if (actor.roles.includes('admin')) who.push('admin');
  if (actor.roles.includes('secretary')) who.push('secretary');
  if (await this.isOwner(actor, appointment.doctorId)) who.push('owner');
  if (!who.some((w) => allowed.includes(w))) {
    throw new AppError('ACESSO_NEGADO', 'Seu perfil não pode fazer esta transição.');
  }
  return this.appointments.updateStatus(id, next);
}
}