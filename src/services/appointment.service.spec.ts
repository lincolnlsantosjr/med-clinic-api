import { describe, expect, it, vi } from 'vitest';
import { Actor, AppointmentModel, ShiftModel } from '../domain/types';
import { AppointmentService } from './appointment.service';

const at = (time: string) => new Date(`2026-10-13T${time}-03:00`); // terça-feira
const doctor = { id: 3, crm: 'CRM-1', user: { id: 7, name: 'H', email: 'h@x.com', passwordHash: 'h', roles: ['doctor' as const] } };
const patient = { id: 10, name: 'Carlos', cpf: '12345678901', createdAt: new Date() };
const shifts: ShiftModel[] = [
  { weekDay: 2, startTime: '08:00', endTime: '12:00', slotDurationMinutes: 30 },
  { weekDay: 2, startTime: '14:00', endTime: '18:00', slotDurationMinutes: 20 },
];
const stored: AppointmentModel = {
  id: 41, doctorId: 3, patientId: 10, startsAt: at('08:00:00'), endsAt: at('08:30:00'), status: 'scheduled',
};

function build(opts: { doctor?: unknown; patient?: unknown; shifts?: ShiftModel[]; doctorBusy?: boolean; patientBusy?: boolean } = {}) {
  const tx = {
    lockDoctor: vi.fn().mockResolvedValue(undefined),
    hasDoctorConflict: vi.fn().mockResolvedValue(opts.doctorBusy ?? false),
    hasPatientConflict: vi.fn().mockResolvedValue(opts.patientBusy ?? false),
    create: vi.fn(async (d) => ({ id: 41, status: 'scheduled' as const, ...d })),
  };
  const transactions = { run: <T>(work: (t: typeof tx) => Promise<T>): Promise<T> => work(tx) };
  const appointments = {
    findById: vi.fn().mockResolvedValue(stored),
    findPage: vi.fn().mockResolvedValue({ items: [stored], total: 1 }),
    findActiveInRange: vi.fn().mockResolvedValue([stored]),
    updateStatus: vi.fn(async (_id: number, status) => ({ ...stored, status })),
    hasLink: vi.fn(),
  };
  const doctors = {
    findById: vi.fn().mockResolvedValue(opts.doctor === undefined ? doctor : opts.doctor),
    findByUserId: vi.fn().mockResolvedValue(doctor),
    findByCrm: vi.fn(), createWithUser: vi.fn(), findPage: vi.fn(),
  };
  const patients = {
    findById: vi.fn().mockResolvedValue(opts.patient === undefined ? patient : opts.patient),
    findByCpf: vi.fn(), create: vi.fn(), update: vi.fn(), softRemove: vi.fn(), findPage: vi.fn(),
  };
  const schedules = { findByDoctor: vi.fn().mockResolvedValue(opts.shifts ?? shifts), replace: vi.fn() };
  const service = new AppointmentService(appointments, doctors, patients, schedules, transactions);
  return { service, tx, appointments, doctors };
}

const input = (time: string) => ({ doctorId: 3, patientId: 10, startsAt: at(time) });

describe('AppointmentService.create', () => {
  it('cria a consulta, calcula o fim pela duração do turno e trava o médico', async () => {
    const { service, tx } = build();
    const result = await service.create(input('08:30:00'));
    expect(result.endsAt).toEqual(at('09:00:00'));
    expect(tx.lockDoctor).toHaveBeenCalledWith(3);
  });

  it('usa a duração do turno da tarde (20 min)', async () => {
    const { service } = build();
    expect((await service.create(input('14:20:00'))).endsAt).toEqual(at('14:40:00'));
  });

  it('recusa horário fora de qualquer turno', async () => {
    const { service } = build();
    await expect(service.create(input('13:00:00'))).rejects.toMatchObject({ code: 'HORARIO_FORA_DA_ESCALA' });
  });

  it('recusa horário desalinhado da grade', async () => {
    const { service } = build();
    await expect(service.create(input('08:20:00'))).rejects.toMatchObject({ code: 'HORARIO_FORA_DA_ESCALA' });
  });

  it('recusa horário com segundos', async () => {
    const { service } = build();
    await expect(service.create(input('08:00:30'))).rejects.toMatchObject({ code: 'HORARIO_FORA_DA_ESCALA' });
  });

  it('recusa consulta que não cabe no fim do turno', async () => {
    const { service } = build({ shifts: [{ weekDay: 2, startTime: '08:00', endTime: '11:00', slotDurationMinutes: 40 }] });
    await expect(service.create(input('10:40:00'))).rejects.toMatchObject({ code: 'HORARIO_FORA_DA_ESCALA' });
  });

  it('409 HORARIO_INDISPONIVEL quando o médico já está ocupado', async () => {
    const { service, tx } = build({ doctorBusy: true });
    await expect(service.create(input('08:00:00'))).rejects.toMatchObject({ code: 'HORARIO_INDISPONIVEL' });
    expect(tx.create).not.toHaveBeenCalled();
  });

  it('409 PACIENTE_INDISPONIVEL quando o paciente já está em outra consulta', async () => {
    const { service } = build({ patientBusy: true });
    await expect(service.create(input('08:00:00'))).rejects.toMatchObject({ code: 'PACIENTE_INDISPONIVEL' });
  });

  it('404 para médico ou paciente inexistente', async () => {
    await expect(build({ doctor: null }).service.create(input('08:00:00'))).rejects.toMatchObject({ code: 'RECURSO_NAO_ENCONTRADO' });
    await expect(build({ patient: null }).service.create(input('08:00:00'))).rejects.toMatchObject({ code: 'RECURSO_NAO_ENCONTRADO' });
  });
});

describe('AppointmentService leitura', () => {
  const admin: Actor = { userId: 1, roles: ['admin'] };
  const doctorActor: Actor = { userId: 7, roles: ['doctor'] };

  it('doctor só enxerga os próprios, ignorando o doctorId da query', async () => {
    const { service, appointments } = build();
    await service.list({ page: 1, pageSize: 20, doctorId: 99 }, doctorActor);
    expect(appointments.findPage).toHaveBeenCalledWith(expect.objectContaining({ doctorId: 3 }));
  });

  it('doctor sem registro de médico recebe lista vazia', async () => {
    const { service, doctors } = build();
    doctors.findByUserId.mockResolvedValue(null);
    expect((await service.list({ page: 1, pageSize: 20 }, doctorActor)).data).toEqual([]);
  });

  it('admin respeita o filtro e converte datas para o dia local da clínica', async () => {
    const { service, appointments } = build();
    await service.list({ page: 1, pageSize: 20, doctorId: 5, from: '2026-10-12', to: '2026-10-16' }, admin);
    expect(appointments.findPage).toHaveBeenCalledWith(expect.objectContaining({
      doctorId: 5, from: new Date('2026-10-12T03:00:00.000Z'), to: new Date('2026-10-17T02:59:59.999Z'),
    }));
  });

  it('getById: 404, 403 para outro médico e ok para o dono', async () => {
    const missing = build();
    missing.appointments.findById.mockResolvedValue(null);
    await expect(missing.service.getById(1, admin)).rejects.toMatchObject({ code: 'RECURSO_NAO_ENCONTRADO' });

    const other = build();
    other.doctors.findByUserId.mockResolvedValue({ ...doctor, id: 4 });
    await expect(other.service.getById(41, doctorActor)).rejects.toMatchObject({ code: 'ACESSO_NEGADO' });

    await expect(build().service.getById(41, doctorActor)).resolves.toEqual(stored);
  });

  it('calendar devolve escala e consultas ativas; 404 sem médico', async () => {
    const { service } = build();
    const result = await service.calendar(3, '2026-10-12', '2026-10-16');
    expect(result.shifts).toEqual(shifts);
    expect(result.appointments).toEqual([stored]);
    await expect(build({ doctor: null }).service.calendar(3, '2026-10-12', '2026-10-16')).rejects.toMatchObject({ code: 'RECURSO_NAO_ENCONTRADO' });
  });
});