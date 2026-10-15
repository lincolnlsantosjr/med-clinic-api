import {
  AppointmentModel, AppointmentStatus, DoctorModel, MedicalRecordModel, PageQuery,
  PageResult, PatientModel, ShiftModel, UserModel,
} from './types';
import { Period } from '../rules/overlap.rules';

export type NewUser = Pick<UserModel, 'name' | 'email' | 'passwordHash' | 'roles'>;
export type NewAppointment = Pick<AppointmentModel, 'doctorId' | 'patientId' | 'startsAt' | 'endsAt'>;

export interface UserRepository {
  findByEmail(email: string): Promise<UserModel | null>;
  findById(id: number): Promise<UserModel | null>;
  create(data: NewUser): Promise<UserModel>;
}

export interface PatientRepository {
  findById(id: number): Promise<PatientModel | null>;
  findByCpf(cpf: string): Promise<PatientModel | null>;
  create(data: { name: string; cpf: string }): Promise<PatientModel>;
  update(id: number, data: { name: string }): Promise<PatientModel>;
  softRemove(id: number): Promise<void>;
  findPage(query: PageQuery & { name?: string }): Promise<PageResult<PatientModel>>;
}

export interface DoctorRepository {
  findById(id: number): Promise<DoctorModel | null>;
  findByCrm(crm: string): Promise<DoctorModel | null>;
  findByUserId(userId: number): Promise<DoctorModel | null>;
  createWithUser(data: { name: string; email: string; passwordHash: string; crm: string }): Promise<DoctorModel>;
  findPage(query: PageQuery & { name?: string }): Promise<PageResult<DoctorModel>>;
}

export interface WorkScheduleRepository {
  findByDoctor(doctorId: number): Promise<ShiftModel[]>;
  replace(doctorId: number, shifts: ShiftModel[]): Promise<ShiftModel[]>;
}

export interface AppointmentListFilter extends PageQuery {
  doctorId?: number; patientId?: number; status?: AppointmentStatus; from?: Date; to?: Date;
}

export interface AppointmentRepository {
  findById(id: number): Promise<AppointmentModel | null>;
  findPage(filter: AppointmentListFilter): Promise<PageResult<AppointmentModel>>;
  findActiveInRange(doctorId: number, from: Date, to: Date): Promise<AppointmentModel[]>;
  updateStatus(id: number, status: AppointmentStatus): Promise<AppointmentModel>;
  hasLink(doctorId: number, patientId: number): Promise<boolean>;
}

export interface AppointmentTxContext {
  lockDoctor(doctorId: number): Promise<void>;
  hasDoctorConflict(doctorId: number, period: Period): Promise<boolean>;
  hasPatientConflict(patientId: number, period: Period): Promise<boolean>;
  create(data: NewAppointment): Promise<AppointmentModel>;
}

export interface AppointmentTransactionRunner {
  run<T>(work: (tx: AppointmentTxContext) => Promise<T>): Promise<T>;
}

export interface MedicalRecordRepository {
  create(data: { patientId: number; doctorId: number; text: string }): Promise<MedicalRecordModel>;
  findPage(patientId: number, query: PageQuery): Promise<PageResult<MedicalRecordModel>>;
}

export interface PasswordHasher {
  hash(plain: string): Promise<string>;
  compare(plain: string, hash: string): Promise<boolean>;
}

export interface TokenProvider {
  sign(payload: { userId: number; roles: UserModel['roles'] }): string;
}