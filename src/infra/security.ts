import { compare, hash } from 'bcryptjs';
import jwt, { SignOptions } from 'jsonwebtoken';
import { env } from '../config/env';
import { PasswordHasher, TokenProvider } from '../domain/ports';

export class BcryptPasswordHasher implements PasswordHasher {
  hash(plain: string): Promise<string> {
    return hash(plain, 10);
  }
  compare(plain: string, hashed: string): Promise<boolean> {
    return compare(plain, hashed);
  }
}

export class JwtTokenProvider implements TokenProvider {
  sign({ userId, roles }: { userId: number; roles: string[] }): string {
    return jwt.sign({ roles }, env.jwtSecret, {
      subject: String(userId),
      expiresIn: env.jwtExpiresIn as SignOptions['expiresIn'],
    });
  }
}