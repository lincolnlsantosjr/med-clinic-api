import { describe, expect, it, vi } from 'vitest';
import { PatientService } from './patient.service';

const patient = { id: 10, name: 'Carlos', cpf: '12345678901', createdAt: new Date() };

function build(found: unknown = patient) {
  const repo = {
    findById: vi.fn().mockResolvedValue(found),
    findByCpf: vi.fn().mockResolvedValue(found),
    create: vi.fn().mockResolvedValue(patient),
    update: vi.fn().mockResolvedValue({ ...patient, name: 'Novo' }),
    softRemove: vi.fn().mockResolvedValue(undefined),
    findPage: vi.fn().mockResolvedValue({ items: [patient], total: 41 }),
  };
  return { service: new PatientService(repo), repo };
}

describe('PatientService', () => {
  it('cria paciente com CPF novo', async () => {
    const { service, repo } = build(null);
    await service.create({ name: 'Carlos', cpf: '12345678901' });
    expect(repo.create).toHaveBeenCalled();
  });

  it('recusa CPF repetido sem criar segundo registro', async () => {
    const { service, repo } = build();
    await expect(service.create({ name: 'X', cpf: '12345678901' })).rejects.toMatchObject({ code: 'CPF_JA_CADASTRADO' });
    expect(repo.create).not.toHaveBeenCalled();
  });

  it('lista com metadados de paginação', async () => {
    const { service } = build();
    const result = await service.list({ page: 1, pageSize: 20 });
    expect(result.meta).toEqual({ total: 41, page: 1, pageSize: 20, totalPages: 3 });
  });

  it('getById devolve 404 quando não existe', async () => {
    const { service } = build(null);
    await expect(service.getById(1)).rejects.toMatchObject({ code: 'RECURSO_NAO_ENCONTRADO' });
  });

  it('update altera o nome e ignora corpo vazio', async () => {
    const { service, repo } = build();
    await service.update(10, { name: 'Novo' });
    expect(repo.update).toHaveBeenCalledWith(10, { name: 'Novo' });
    repo.update.mockClear();
    await service.update(10, {});
    expect(repo.update).not.toHaveBeenCalled();
  });

  it('remove paciente existente', async () => {
    const { service, repo } = build();
    await service.remove(10);
    expect(repo.softRemove).toHaveBeenCalledWith(10);
  });
});