import { DoctorRepository, PasswordHasher, UserRepository } from '../domain/ports';
import { DoctorModel, PageQuery, Paginated } from '../domain/types';
import { AppError, notFound } from '../errors/app-error';
import { paginate } from '../shared/pagination';

export class DoctorService {
  constructor(
    private readonly users: UserRepository,
    private readonly doctors: DoctorRepository,
    private readonly hasher: PasswordHasher,
  ) {}

  async create(input: { name: string; email: string; password: string; crm: string }): Promise<DoctorModel> {
    if (await this.users.findByEmail(input.email)) throw new AppError('EMAIL_JA_CADASTRADO', 'E-mail já cadastrado.');
    if (await this.doctors.findByCrm(input.crm)) throw new AppError('CRM_JA_CADASTRADO', 'CRM já cadastrado.');
    const passwordHash = await this.hasher.hash(input.password);
    return this.doctors.createWithUser({ name: input.name, email: input.email, passwordHash, crm: input.crm });
  }

  async getById(id: number): Promise<DoctorModel> {
    const doctor = await this.doctors.findById(id);
    if (!doctor) throw notFound('Médico');
    return doctor;
  }

  async list(query: PageQuery & { name?: string }): Promise<Paginated<DoctorModel>> {
    return paginate(await this.doctors.findPage(query), query);
  }
}