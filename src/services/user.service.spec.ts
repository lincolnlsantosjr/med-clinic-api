import { describe, expect, it, vi } from 'vitest';
import { UserService } from './user.service';

function build(existing: unknown) {
  const users = {
    findByEmail: vi.fn().mockResolvedValue(existing),
    findById: vi.fn().mockResolvedValue(existing),
    create: vi.fn(async (d) => ({ id: 2, ...d })),
  };
  const hasher = { hash: vi.fn().mockResolvedValue('hashed'), compare: vi.fn() };
  return { service: new UserService(users, hasher), users };
}

describe('UserService', () => {
  it('cria usuário guardando só o hash da senha', async () => {
    const { service, users } = build(null);
    await service.create({ name: 'Joana', email: 'j@x.com', password: 'SenhaForte@123', roles: ['secretary'] });
    expect(users.create).toHaveBeenCalledWith({ name: 'Joana', email: 'j@x.com', passwordHash: 'hashed', roles: ['secretary'] });
  });

  it('recusa e-mail repetido', async () => {
    const { service } = build({ id: 1 });
    await expect(
      service.create({ name: 'J', email: 'j@x.com', password: 'SenhaForte@123', roles: ['secretary'] }),
    ).rejects.toMatchObject({ code: 'EMAIL_JA_CADASTRADO' });
  });

  it('getById falha com 401 quando o usuário não existe', async () => {
    const { service } = build(null);
    await expect(service.getById(9)).rejects.toMatchObject({ code: 'NAO_AUTENTICADO' });
  });
});