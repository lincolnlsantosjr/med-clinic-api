import { PatientRepository } from '../domain/ports';
import { PageQuery, Paginated, PatientModel } from '../domain/types';
import { AppError, notFound } from '../errors/app-error';
import { paginate } from '../shared/pagination';

export class PatientService {
  constructor(private readonly patients: PatientRepository) {}

  async create(input: { name: string; cpf: string }): Promise<PatientModel> {
    if (await this.patients.findByCpf(input.cpf)) {
      throw new AppError('CPF_JA_CADASTRADO', 'CPF já cadastrado.');
    }
    return this.patients.create(input);
  }

  async list(query: PageQuery & { name?: string }): Promise<Paginated<PatientModel>> {
    return paginate(await this.patients.findPage(query), query);
  }

  async getById(id: number): Promise<PatientModel> {
    const patient = await this.patients.findById(id);
    if (!patient) throw notFound('Paciente');
    return patient;
  }

  async update(id: number, data: { name?: string }): Promise<PatientModel> {
    const patient = await this.getById(id);
    if (data.name === undefined) return patient;
    return this.patients.update(id, { name: data.name });
  }

  async remove(id: number): Promise<void> {
    await this.getById(id);
    await this.patients.softRemove(id);
  }
}