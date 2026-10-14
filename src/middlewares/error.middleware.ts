import { ErrorRequestHandler, Request, Response } from 'express';
import { ZodError } from 'zod';
import { AppError, ErrorCode } from '../errors/app-error';

const STATUS: Record<ErrorCode, number> = {
  DADOS_INVALIDOS: 400, NAO_AUTENTICADO: 401, CREDENCIAIS_INVALIDAS: 401, ACESSO_NEGADO: 403,
  RECURSO_NAO_ENCONTRADO: 404, EMAIL_JA_CADASTRADO: 409, CPF_JA_CADASTRADO: 409,
  CRM_JA_CADASTRADO: 409, HORARIO_INDISPONIVEL: 409, PACIENTE_INDISPONIVEL: 409,
  HORARIO_FORA_DA_ESCALA: 422, TRANSICAO_INVALIDA: 422, ERRO_INTERNO: 500,
};

const send = (res: Response, code: ErrorCode, message: string): void => {
  res.status(STATUS[code]).json({ statusCode: STATUS[code], error: code, message });
};

export function notFoundHandler(_req: Request, _res: Response): void {
  throw new AppError('RECURSO_NAO_ENCONTRADO', 'Rota não encontrada.');
}

export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  if (err instanceof AppError) {
    send(res, err.code, err.message);
  } else if (err instanceof ZodError) {
    send(res, 'DADOS_INVALIDOS', err.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join('; '));
  } else if (typeof err === 'object' && err !== null && (err as { status?: number }).status === 400) {
    send(res, 'DADOS_INVALIDOS', 'Corpo da requisição inválido.');
  } else {
    console.error(err);
    send(res, 'ERRO_INTERNO', 'Erro interno do servidor.');
  }
};