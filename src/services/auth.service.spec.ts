import { describe, expect, it, vi } from 'vitest';
import { UserModel } from '../domain/types';
import { AuthService } from './auth.service';

const user: UserModel = { id: 1, name: 'Admin', email: 'admin@medclinic.com', passwordHash: 'hash', roles: ['admin'] };

function build(found: UserModel | null, passwordOk: boolean) {
  const users = { findByEmail: vi.fn().mockResolvedValue(found), findById: vi.fn(), create: vi.fn() };
  const hasher = { hash: vi.fn(), compare: vi.fn().mockResolvedValue(passwordOk) };
  const tokens = { sign: vi.fn().mockReturnValue('jwt-token') };
  return { service: new AuthService(users, hasher, tokens), hasher, tokens };
}

describe('AuthService.login', () => {
  it('devolve o token quando a senha confere com o hash', async () => {
    const { service, hasher, tokens } = build(user, true);
    await expect(service.login(user.email, 'SenhaForte@123')).resolves.toEqual({ accessToken: 'jwt-token' });
    expect(hasher.compare).toHaveBeenCalledWith('SenhaForte@123', 'hash');
    expect(tokens.sign).toHaveBeenCalledWith({ userId: 1, roles: ['admin'] });
  });

  it('recusa senha incorreta', async () => {
    const { service } = build(user, false);
    await expect(service.login(user.email, 'errada')).rejects.toMatchObject({ code: 'CREDENCIAIS_INVALIDAS' });
  });

  it('recusa e-mail inexistente sem comparar senha', async () => {
    const { service, hasher } = build(null, true);
    await expect(service.login('x@x.com', 'qualquer')).rejects.toMatchObject({ code: 'CREDENCIAIS_INVALIDAS' });
    expect(hasher.compare).not.toHaveBeenCalled();
  });
});