import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { Actor, ROLES, Role } from '../domain/types';
import { AppError } from '../errors/app-error';

export function authenticate(req: Request, _res: Response, next: NextFunction): void {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) throw new AppError('NAO_AUTENTICADO', 'Token ausente.');
  try {
    const payload = jwt.verify(header.slice(7), env.jwtSecret);
    if (typeof payload === 'string') throw new Error('payload inválido');
    const roles = (Array.isArray(payload.roles) ? payload.roles : []).filter(
      (r): r is Role => ROLES.includes(r),
    );
    req.user = { id: Number(payload.sub), roles };
  } catch {
    throw new AppError('NAO_AUTENTICADO', 'Token inválido ou expirado.');
  }
  next();
}

export const authorize =
  (...allowed: Role[]) =>
  (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user || !req.user.roles.some((r) => allowed.includes(r))) {
      throw new AppError('ACESSO_NEGADO', 'Perfil sem permissão para este recurso.');
    }
    next();
  };

export function actorOf(req: Request): Actor {
  if (!req.user) throw new AppError('NAO_AUTENTICADO', 'Token ausente.');
  return { userId: req.user.id, roles: req.user.roles };
}