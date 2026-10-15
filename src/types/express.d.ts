import type { Role } from '../domain/types';

declare global {
  namespace Express {
    interface Request {
      user?: { id: number; roles: Role[] };
    }
  }
}

export {};