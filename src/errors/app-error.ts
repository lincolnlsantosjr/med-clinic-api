export type ErrorCode =
  | 'DADOS_INVALIDOS' | 'NAO_AUTENTICADO' | 'CREDENCIAIS_INVALIDAS' | 'ACESSO_NEGADO'
  | 'RECURSO_NAO_ENCONTRADO' | 'EMAIL_JA_CADASTRADO' | 'CPF_JA_CADASTRADO'
  | 'CRM_JA_CADASTRADO' | 'HORARIO_INDISPONIVEL' | 'PACIENTE_INDISPONIVEL'
  | 'HORARIO_FORA_DA_ESCALA' | 'TRANSICAO_INVALIDA' | 'ERRO_INTERNO';

export class AppError extends Error {
  constructor(public readonly code: ErrorCode, message: string) {
    super(message);
  }
}

export const notFound = (what: string): AppError =>
  new AppError('RECURSO_NAO_ENCONTRADO', `${what} não encontrado.`);