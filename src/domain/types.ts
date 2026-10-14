export const ROLES = ['admin', 'secretary', 'doctor'] as const;
export type Role = (typeof ROLES)[number];

export const APPOINTMENT_STATUSES = ['scheduled', 'in_progress', 'done', 'cancelled'] as const;
export type AppointmentStatus = (typeof APPOINTMENT_STATUSES)[number];

export interface UserModel { id: number; name: string; email: string; passwordHash: string; roles: Role[] }
export interface PatientModel { id: number; name: string; cpf: string; createdAt: Date }
export interface DoctorModel { id: number; crm: string; user: UserModel }
export interface ShiftModel { weekDay: number; startTime: string; endTime: string; slotDurationMinutes: number }
export interface AppointmentModel {
  id: number; doctorId: number; patientId: number;
  startsAt: Date; endsAt: Date; status: AppointmentStatus;
}
export interface MedicalRecordModel {
  id: number; patientId: number; doctorId: number; text: string; createdAt: Date;
}

export interface Actor { userId: number; roles: Role[] }
export interface PageQuery { page: number; pageSize: number }
export interface PageResult<T> { items: T[]; total: number }
export interface Paginated<T> {
  data: T[];
  meta: { total: number; page: number; pageSize: number; totalPages: number };
}