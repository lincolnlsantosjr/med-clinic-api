import { Request, Response } from 'express';
import { toPatientDto } from '../dtos/mappers';
import { PatientService } from '../services/patient.service';
import { idParams, nameListQuery } from '../validators/common';
import { createPatientBody, updatePatientBody } from '../validators/patient.validators';

export class PatientController {
  constructor(private readonly patients: PatientService) {}

  create = async (req: Request, res: Response): Promise<void> => {
    const patient = await this.patients.create(createPatientBody.parse(req.body));
    res.status(201).json(toPatientDto(patient));
  };

  list = async (req: Request, res: Response): Promise<void> => {
    const result = await this.patients.list(nameListQuery.parse(req.query));
    res.json({ data: result.data.map(toPatientDto), meta: result.meta });
  };

  getById = async (req: Request, res: Response): Promise<void> => {
    const { id } = idParams.parse(req.params);
    res.json(toPatientDto(await this.patients.getById(id)));
  };

  update = async (req: Request, res: Response): Promise<void> => {
    const { id } = idParams.parse(req.params);
    res.json(toPatientDto(await this.patients.update(id, updatePatientBody.parse(req.body))));
  };

  remove = async (req: Request, res: Response): Promise<void> => {
    const { id } = idParams.parse(req.params);
    await this.patients.remove(id);
    res.status(204).send();
  };
}