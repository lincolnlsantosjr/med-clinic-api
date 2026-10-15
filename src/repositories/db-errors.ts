import { QueryFailedError } from 'typeorm';
import { AppError, ErrorCode } from '../errors/app-error';

const UNIQUE: Record<string, [ErrorCode, string]> = {
  uq_users_email: ['EMAIL_JA_CADASTRADO', 'E-mail já cadastrado.'],
  uq_patients_cpf: ['CPF_JA_CADASTRADO', 'CPF já cadastrado.'],
  uq_doctors_crm: ['CRM_JA_CADASTRADO', 'CRM já cadastrado.'],
};

export function translateDbError(error: unknown): never {
  if (error instanceof QueryFailedError) {
    const driver = error.driverError as { code?: string; constraint?: string };
    const mapped = driver.constraint ? UNIQUE[driver.constraint] : undefined;
    if (driver.code === '23505' && mapped) throw new AppError(mapped[0], mapped[1]);
  }
  throw error;
}