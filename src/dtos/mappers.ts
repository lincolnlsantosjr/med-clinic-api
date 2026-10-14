import {
  AppointmentModel, DoctorModel, MedicalRecordModel, PatientModel, UserModel,
} from '../domain/types';

export const toUserDto = (u: UserModel) => ({ id: u.id, name: u.name, email: u.email, roles: u.roles });

export const toPatientDto = (p: PatientModel) => ({
  id: p.id, name: p.name, cpf: p.cpf, createdAt: p.createdAt.toISOString(),
});

export const toDoctorDto = (d: DoctorModel) => ({ id: d.id, crm: d.crm, user: toUserDto(d.user) });

export const toAppointmentDto = (a: AppointmentModel) => ({
  id: a.id, doctorId: a.doctorId, patientId: a.patientId,
  startsAt: a.startsAt.toISOString(), endsAt: a.endsAt.toISOString(), status: a.status,
});

export const toCalendarItemDto = (a: AppointmentModel) => ({
  id: a.id, patientId: a.patientId,
  startsAt: a.startsAt.toISOString(), endsAt: a.endsAt.toISOString(), status: a.status,
});

export const toRecordDto = (r: MedicalRecordModel) => ({
  id: r.id, patientId: r.patientId, doctorId: r.doctorId, text: r.text,
  createdAt: r.createdAt.toISOString(),
});