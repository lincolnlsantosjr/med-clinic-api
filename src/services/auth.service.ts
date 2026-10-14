import { PasswordHasher, TokenProvider, UserRepository } from '../domain/ports';
import { AppError } from '../errors/app-error';

export class AuthService {
  constructor(
    private readonly users: UserRepository,
    private readonly hasher: PasswordHasher,
    private readonly tokens: TokenProvider,
  ) {}

  async login(email: string, password: string): Promise<{ accessToken: string }> {
    const user = await this.users.findByEmail(email);
    const passwordOk = user ? await this.hasher.compare(password, user.passwordHash) : false;
    if (!user || !passwordOk) {
      throw new AppError('CREDENCIAIS_INVALIDAS', 'E-mail ou senha incorretos.');
    }
    return { accessToken: this.tokens.sign({ userId: user.id, roles: user.roles }) };
  }
}