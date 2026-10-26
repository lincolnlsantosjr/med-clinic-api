import { DataSource } from 'typeorm';
import { DoctorRepository } from '../domain/ports';
import { DoctorModel, PageQuery, PageResult } from '../domain/types';
import { Doctor } from '../entities/doctor.entity';
import { User } from '../entities/user.entity';
import { translateDbError } from './db-errors';

export class TypeormDoctorRepository implements DoctorRepository {
  constructor(private readonly ds: DataSource) {}

  private get repo() {
    return this.ds.getRepository(Doctor);
  }

  findById(id: number): Promise<DoctorModel | null> {
    return this.repo.findOneBy({ id });
  }

  findByCrm(crm: string): Promise<DoctorModel | null> {
    return this.repo.findOneBy({ crm });
  }

  findByUserId(userId: number): Promise<DoctorModel | null> {
    return this.repo.findOneBy({ user: { id: userId } });
  }

  async createWithUser(data: { name: string; email: string; passwordHash: string; crm: string }): Promise<DoctorModel> {
    try {
      return await this.ds.transaction(async (manager) => {
        const user = await manager.save(
          User,
          manager.create(User, { name: data.name, email: data.email, passwordHash: data.passwordHash, roles: ['doctor'] }),
        );
        return manager.save(Doctor, manager.create(Doctor, { crm: data.crm, user }));
      });
    } catch (error) {
      return translateDbError(error);
    }
  }

  async findPage({ name, page, pageSize }: PageQuery & { name?: string }): Promise<PageResult<DoctorModel>> {
    const qb = this.repo
      .createQueryBuilder('d')
      .leftJoinAndSelect('d.user', 'u')
      .orderBy('d.id', 'ASC')
      .skip((page - 1) * pageSize)
      .take(pageSize);
    if (name) qb.where('u.name ILIKE :name', { name: `%${name}%` });
    const [items, total] = await qb.getManyAndCount();
    return { items, total };
  }
}