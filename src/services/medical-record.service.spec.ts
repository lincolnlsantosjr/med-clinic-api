import { describe, expect, it, vi } from 'vitest';
import { Actor } from '../domain/types';
import { MedicalRecordService } from './medical-record.service';

const doctorActor: Actor = { userId: 7, roles: ['doctor'] };
const admin: Actor = { userId: 1, roles: ['admin'] };
const secretary: Actor = { userId: 2, roles: ['secretary'] };

function build(opts: { patient?: unknown; doctor?: unknown; linked?: boolean } = {}) {
  const records = {
    create: vi.fn(async (d) => ({ id: 5, createdAt: new Date(), ...d })),
    findPage: vi.fn().mockResolvedValue({ items: [], total: 0 }),
  };
  const patients = { findById: vi.fn().mockResolvedValue(opts.patient === undefined ? { id: 10 } : opts.patient),
    findByCpf: vi.fn(), create: vi.fn(), update: vi.fn(), softRemove: vi.fn(), findPage: vi.fn() };
  const doctors = { findByUserId: vi.fn().mockResolvedValue(opts.doctor === undefined ? { id: 3 } : opts.doctor),
    findById: vi.fn(), findByCrm: vi.fn(), createWithUser: vi.fn(), findPage: vi.fn() };
  const appointments = { hasLink: vi.fn().mockResolvedValue(opts.linked ?? true),
    findById: vi.fn(), findPage: vi.fn(), findActiveInRange: vi.fn(), updateStatus: vi.fn() };
  return { service: new MedicalRecordService(records, patients, doctors, appointments), records };
}

describe('MedicalRecordService.create', () => {
  it('médico com vínculo escreve e o autor vem do token', async () => {
    const { service, records } = build();
    await service.create(doctorActor, 10, 'Dor lombar');
    expect(records.create).toHaveBeenCalledWith({ patientId: 10, doctorId: 3, text: 'Dor lombar' });
  });

  it('médico sem vínculo recebe ACESSO_NEGADO', async () => {
    const { service, records } = build({ linked: false });
    await expect(service.create(doctorActor, 10, 'x')).rejects.toMatchObject({ code: 'ACESSO_NEGADO' });
    expect(records.create).not.toHaveBeenCalled();
  });

  it('admin e secretária não escrevem', async () => {
    const { service } = build();
    await expect(service.create(admin, 10, 'x')).rejects.toMatchObject({ code: 'ACESSO_NEGADO' });
    await expect(service.create(secretary, 10, 'x')).rejects.toMatchObject({ code: 'ACESSO_NEGADO' });
  });

  it('404 para paciente inexistente', async () => {
    const { service } = build({ patient: null });
    await expect(service.create(doctorActor, 99, 'x')).rejects.toMatchObject({ code: 'RECURSO_NAO_ENCONTRADO' });
  });

  it('usuário com perfil doctor sem registro de médico é negado', async () => {
    const { service } = build({ doctor: null });
    await expect(service.create(doctorActor, 10, 'x')).rejects.toMatchObject({ code: 'ACESSO_NEGADO' });
  });
});

describe('MedicalRecordService.list', () => {
  const query = { page: 1, pageSize: 20 };

  it('admin lê para auditoria sem precisar de vínculo', async () => {
    const { service } = build({ linked: false });
    await expect(service.list(admin, 10, query)).resolves.toMatchObject({ data: [] });
  });

  it('médico com vínculo lê; sem vínculo é negado', async () => {
    await expect(build().service.list(doctorActor, 10, query)).resolves.toBeDefined();
    await expect(build({ linked: false }).service.list(doctorActor, 10, query)).rejects.toMatchObject({ code: 'ACESSO_NEGADO' });
  });

  it('secretária não lê', async () => {
    await expect(build().service.list(secretary, 10, query)).rejects.toMatchObject({ code: 'ACESSO_NEGADO' });
  });

  it('404 para paciente inexistente', async () => {
    await expect(build({ patient: null }).service.list(admin, 99, query)).rejects.toMatchObject({ code: 'RECURSO_NAO_ENCONTRADO' });
  });
});