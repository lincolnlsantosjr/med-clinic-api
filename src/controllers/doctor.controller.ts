import { Request, Response } from 'express';
import { toDoctorDto } from '../dtos/mappers';
import { DoctorService } from '../services/doctor.service';
import { idParams, nameListQuery } from '../validators/common';
import { createDoctorBody } from '../validators/doctor.validators';

export class DoctorController {
  constructor(private readonly doctors: DoctorService) {}

  create = async (req: Request, res: Response): Promise<void> => {
    const doctor = await this.doctors.create(createDoctorBody.parse(req.body));
    res.status(201).json(toDoctorDto(doctor));
  };

  list = async (req: Request, res: Response): Promise<void> => {
    const result = await this.doctors.list(nameListQuery.parse(req.query));
    res.json({ data: result.data.map(toDoctorDto), meta: result.meta });
  };

  getById = async (req: Request, res: Response): Promise<void> => {
    const { id } = idParams.parse(req.params);
    res.json(toDoctorDto(await this.doctors.getById(id)));
  };
}