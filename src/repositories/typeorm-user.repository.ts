import { Repository } from 'typeorm';
import { NewUser, UserRepository } from '../domain/ports';
import { UserModel } from '../domain/types';
import { User } from '../entities/user.entity';
import { translateDbError } from './db-errors';

export class TypeormUserRepository implements UserRepository {
  constructor(private readonly repo: Repository<User>) {}

  findByEmail(email: string): Promise<UserModel | null> {
    return this.repo.findOneBy({ email });
  }

  findById(id: number): Promise<UserModel | null> {
    return this.repo.findOneBy({ id });
  }

  async create(data: NewUser): Promise<UserModel> {
    try {
      return await this.repo.save(this.repo.create(data));
    } catch (error) {
      return translateDbError(error);
    }
  }
}