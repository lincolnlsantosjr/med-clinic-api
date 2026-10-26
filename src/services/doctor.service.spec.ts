import { describe, expect, it, vi } from 'vitest';
import { DoctorService } from './doctor.service';

const input = { name: 'Helena', email: 'h@x.com', password: 'SenhaForte@123', crm: 'CRM-SC-1' };

function build(emailTaken: boolean, crmTaken: boolean, found: unknown = { id: 3 }) {
  const users = { findByEmail: vi.fn().mockResolvedValue(emailTaken ? { id: 1 } : null), findById: vi.fn(), create: vi.fn() };
  const doctors = {
    findByCrm: vi.fn().mockResolvedValue(crmTaken ? { id: 1 } : null),
    findById: vi.fn().mockResolvedValue(found),
    findByUserId: vi.fn(),
    createWithUser: vi.fn().mockResolvedValue({ id: 3 }),
    findPage: vi.fn().mockResolvedValue({ items: [], total: 0 }),
  };
  const hasher = { hash: vi.fn().mockResolvedValue('hashed'), compare: vi.fn() };
  return { service: new DoctorService(users, doctors, hasher), doctors };
}

describe('DoctorService', () => {
  it('cria médico e usuário numa única chamada atômica', async () => {
    const { service, doctors } = build(false, false);
    await service.create(input);
    expect(doctors.createWithUser).toHaveBeenCalledWith({ name: 'Helena', email: 'h@x.com', passwordHash: 'hashed', crm: 'CRM-SC-1' });
  });

  it('recusa e-mail repetido', async () => {
    const { service, doctors } = build(true, false);
    await expect(service.create(input)).rejects.toMatchObject({ code: 'EMAIL_JA_CADASTRADO' });
    expect(doctors.createWithUser).not.toHaveBeenCalled();
  });

  it('recusa CRM repetido sem criar nada', async () => {
    const { service, doctors } = build(false, true);
    await expect(service.create(input)).rejects.toMatchObject({ code: 'CRM_JA_CADASTRADO' });
    expect(doctors.createWithUser).not.toHaveBeenCalled();
  });

  it('getById devolve 404 quando não existe', async () => {
    const { service } = build(false, false, null);
    await expect(service.getById(1)).rejects.toMatchObject({ code: 'RECURSO_NAO_ENCONTRADO' });
  });

  it('lista com paginação', async () => {
    const { service } = build(false, false);
    expect((await service.list({ page: 1, pageSize: 20 })).meta.totalPages).toBe(0);
  });

  
it('getById devolve o médico quando ele existe', async () => {
  const doctor = { id: 3 };
  const { service, doctors } = build(false, false, doctor);

  await expect(service.getById(3)).resolves.toEqual(doctor);
  expect(doctors.findById).toHaveBeenCalledWith(3);
});

});