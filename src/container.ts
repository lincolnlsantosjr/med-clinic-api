import { DataSource } from 'typeorm';
import { AuthController } from './controllers/auth.controller';
import { UserController } from './controllers/user.controller';
import { User } from './entities/user.entity';
import { BcryptPasswordHasher, JwtTokenProvider } from './infra/security';
import { TypeormUserRepository } from './repositories/typeorm-user.repository';
import { AuthService } from './services/auth.service';
import { UserService } from './services/user.service';

export function buildControllers(ds: DataSource) {
  const hasher = new BcryptPasswordHasher();
  const tokens = new JwtTokenProvider();

  const userRepo = new TypeormUserRepository(ds.getRepository(User));

  const authService = new AuthService(userRepo, hasher, tokens);
  const userService = new UserService(userRepo, hasher);

  return {
    auth: new AuthController(authService),
    users: new UserController(userService),
  };
}

export type Controllers = ReturnType<typeof buildControllers>;