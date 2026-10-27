import { AppointmentRepository, DoctorRepository, MedicalRecordRepository, PatientRepository } from '../domain/ports';
import { Actor, MedicalRecordModel, PageQuery, Paginated } from '../domain/types';
import { AppError, notFound } from '../errors/app-error';
import { paginate } from '../shared/pagination';

const denied = (): AppError => new AppError('ACESSO_NEGADO', 'Sem acesso ao prontuário deste paciente.');

export class MedicalRecordService {
  constructor(
    private readonly records: MedicalRecordRepository,
    private readonly patients: PatientRepository,
    private readonly doctors: DoctorRepository,
    private readonly appointments: AppointmentRepository,
  ) {}

  async create(actor: Actor, patientId: number, text: string): Promise<MedicalRecordModel> {
    if (!actor.roles.includes('doctor')) throw denied();
    await this.ensurePatient(patientId);
    const doctorId = await this.linkedDoctorId(actor, patientId);
    return this.records.create({ patientId, doctorId, text });
  }

  async list(actor: Actor, patientId: number, query: PageQuery): Promise<Paginated<MedicalRecordModel>> {
    const isAdmin = actor.roles.includes('admin');
    if (!isAdmin && !actor.roles.includes('doctor')) throw denied();
    await this.ensurePatient(patientId);
    if (!isAdmin) await this.linkedDoctorId(actor, patientId);
    return paginate(await this.records.findPage(patientId, query), query);
  }

  private async ensurePatient(patientId: number): Promise<void> {
    if (!(await this.patients.findById(patientId))) throw notFound('Paciente');
  }

  /** O doctorId vem sempre do token, nunca do corpo; exige vínculo (consulta in_progress ou done). */
  private async linkedDoctorId(actor: Actor, patientId: number): Promise<number> {
    const doctor = await this.doctors.findByUserId(actor.userId);
    if (!doctor || !(await this.appointments.hasLink(doctor.id, patientId))) throw denied();
    return doctor.id;
  }
}