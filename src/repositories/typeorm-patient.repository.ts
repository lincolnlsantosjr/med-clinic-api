import { Repository } from 'typeorm';
import { PatientRepository } from '../domain/ports';
import { PageQuery, PageResult, PatientModel } from '../domain/types';
import { Patient } from '../entities/patient.entity';
import { translateDbError } from './db-errors';

export class TypeormPatientRepository implements PatientRepository {
  constructor(private readonly repo: Repository<Patient>) {}

  findById(id: number): Promise<PatientModel | null> {
    return this.repo.findOneBy({ id });
  }

  findByCpf(cpf: string): Promise<PatientModel | null> {
    return this.repo.findOneBy({ cpf });
  }

  async create(data: { name: string; cpf: string }): Promise<PatientModel> {
    try {
      return await this.repo.save(this.repo.create(data));
    } catch (error) {
      return translateDbError(error);
    }
  }

  async update(id: number, data: { name: string }): Promise<PatientModel> {
    await this.repo.update(id, data);
    return this.repo.findOneByOrFail({ id });
  }

  async softRemove(id: number): Promise<void> {
    await this.repo.softDelete(id);
  }

  async findPage({ name, page, pageSize }: PageQuery & { name?: string }): Promise<PageResult<PatientModel>> {
    const qb = this.repo.createQueryBuilder('p').orderBy('p.id', 'ASC').skip((page - 1) * pageSize).take(pageSize);
    if (name) qb.where('p.name ILIKE :name', { name: `%${name}%` });
    const [items, total] = await qb.getManyAndCount();
    return { items, total };
  }
}