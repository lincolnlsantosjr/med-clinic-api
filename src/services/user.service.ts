import { PasswordHasher, UserRepository } from '../domain/ports';
import { Role, UserModel } from '../domain/types';
import { AppError } from '../errors/app-error';

export class UserService {
  constructor(private readonly users: UserRepository, private readonly hasher: PasswordHasher) {}

  async create(input: { name: string; email: string; password: string; roles: Role[] }): Promise<UserModel> {
    if (await this.users.findByEmail(input.email)) {
      throw new AppError('EMAIL_JA_CADASTRADO', 'E-mail já cadastrado.');
    }
    const passwordHash = await this.hasher.hash(input.password);
    return this.users.create({ name: input.name, email: input.email, passwordHash, roles: input.roles });
  }

  async getById(id: number): Promise<UserModel> {
    const user = await this.users.findById(id);
    if (!user) throw new AppError('NAO_AUTENTICADO', 'Usuário não encontrado.');
    return user;
  }
}