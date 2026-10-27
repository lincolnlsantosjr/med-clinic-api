import { Repository } from 'typeorm';
import { MedicalRecordRepository } from '../domain/ports';
import { MedicalRecordModel, PageQuery, PageResult } from '../domain/types';
import { MedicalRecord } from '../entities/medical-record.entity';

export class TypeormMedicalRecordRepository implements MedicalRecordRepository {
  constructor(private readonly repo: Repository<MedicalRecord>) {}

  create(data: { patientId: number; doctorId: number; text: string }): Promise<MedicalRecordModel> {
    return this.repo.save(this.repo.create(data));
  }

  async findPage(patientId: number, { page, pageSize }: PageQuery): Promise<PageResult<MedicalRecordModel>> {
    const [items, total] = await this.repo.findAndCount({
      where: { patientId },
      order: { createdAt: 'DESC', id: 'DESC' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    });
    return { items, total };
  }
}