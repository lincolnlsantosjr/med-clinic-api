import { Request, Response } from 'express';
import { toRecordDto } from '../dtos/mappers';
import { actorOf } from '../middlewares/auth.middleware';
import { MedicalRecordService } from '../services/medical-record.service';
import { idParams, pageQuery } from '../validators/common';
import { recordBody } from '../validators/record.validators';

export class MedicalRecordController {
  constructor(private readonly records: MedicalRecordService) {}

  create = async (req: Request, res: Response): Promise<void> => {
    const { id } = idParams.parse(req.params);
    const { text } = recordBody.parse(req.body);
    res.status(201).json(toRecordDto(await this.records.create(actorOf(req), id, text)));
  };

  list = async (req: Request, res: Response): Promise<void> => {
    const { id } = idParams.parse(req.params);
    const result = await this.records.list(actorOf(req), id, pageQuery.parse(req.query));
    res.json({ data: result.data.map(toRecordDto), meta: result.meta });
  };
}