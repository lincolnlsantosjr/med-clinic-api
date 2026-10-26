import { DataSource, EntityManager, In, Repository } from 'typeorm';
import {
  AppointmentListFilter, AppointmentRepository, AppointmentTransactionRunner, AppointmentTxContext, NewAppointment,
} from '../domain/ports';
import { AppointmentModel, AppointmentStatus, PageResult } from '../domain/types';
import { Appointment } from '../entities/appointment.entity';
import { Doctor } from '../entities/doctor.entity';
import { Period } from '../rules/overlap.rules';

export class TypeormAppointmentRepository implements AppointmentRepository {
  constructor(private readonly repo: Repository<Appointment>) {}

  findById(id: number): Promise<AppointmentModel | null> {
    return this.repo.findOneBy({ id });
  }

  async findPage(f: AppointmentListFilter): Promise<PageResult<AppointmentModel>> {
    const qb = this.repo
      .createQueryBuilder('a')
      .orderBy('a.startsAt', 'ASC')
      .addOrderBy('a.id', 'ASC')
      .skip((f.page - 1) * f.pageSize)
      .take(f.pageSize);
    if (f.doctorId !== undefined) qb.andWhere('a.doctorId = :doctorId', { doctorId: f.doctorId });
    if (f.patientId !== undefined) qb.andWhere('a.patientId = :patientId', { patientId: f.patientId });
    if (f.status) qb.andWhere('a.status = :status', { status: f.status });
    if (f.from) qb.andWhere('a.startsAt >= :from', { from: f.from });
    if (f.to) qb.andWhere('a.startsAt <= :to', { to: f.to });
    const [items, total] = await qb.getManyAndCount();
    return { items, total };
  }

  findActiveInRange(doctorId: number, from: Date, to: Date): Promise<AppointmentModel[]> {
    return this.repo
      .createQueryBuilder('a')
      .where('a.doctorId = :doctorId', { doctorId })
      .andWhere('a.status <> :cancelled', { cancelled: 'cancelled' })
      .andWhere('a.startsAt >= :from AND a.startsAt <= :to', { from, to })
      .orderBy('a.startsAt', 'ASC')
      .getMany();
  }

  async updateStatus(id: number, status: AppointmentStatus): Promise<AppointmentModel> {
    await this.repo.update(id, { status });
    return this.repo.findOneByOrFail({ id });
  }

  async hasLink(doctorId: number, patientId: number): Promise<boolean> {
    const count = await this.repo.count({ where: { doctorId, patientId, status: In(['in_progress', 'done']) } });
    return count > 0;
  }
}

class TypeormAppointmentTxContext implements AppointmentTxContext {
  constructor(private readonly manager: EntityManager) {}

  async lockDoctor(doctorId: number): Promise<void> {
    await this.manager.findOne(Doctor, { where: { id: doctorId }, lock: { mode: 'pessimistic_write' } });
  }

  async hasDoctorConflict(doctorId: number, period: Period): Promise<boolean> {
    return this.countOverlaps('a.doctorId = :ownerId', doctorId, period);
  }

  async hasPatientConflict(patientId: number, period: Period): Promise<boolean> {
    return this.countOverlaps('a.patientId = :ownerId', patientId, period);
  }

  create(data: NewAppointment): Promise<AppointmentModel> {
    const repo = this.manager.getRepository(Appointment);
    return repo.save(repo.create({ ...data, status: 'scheduled' }));
  }

  private async countOverlaps(ownerClause: string, ownerId: number, period: Period): Promise<boolean> {
    const count = await this.manager
      .getRepository(Appointment)
      .createQueryBuilder('a')
      .where(ownerClause, { ownerId })
      .andWhere('a.status <> :cancelled', { cancelled: 'cancelled' })
      .andWhere('a.startsAt < :end', { end: period.end })
      .andWhere('a.endsAt > :start', { start: period.start })
      .getCount();
    return count > 0;
  }
}

export class TypeormAppointmentTransactionRunner implements AppointmentTransactionRunner {
  constructor(private readonly ds: DataSource) {}

  run<T>(work: (tx: AppointmentTxContext) => Promise<T>): Promise<T> {
    return this.ds.transaction((manager) => work(new TypeormAppointmentTxContext(manager)));
  }
}