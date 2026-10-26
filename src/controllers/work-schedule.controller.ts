import { Request, Response } from 'express';
import { WorkScheduleService } from '../services/work-schedule.service';
import { idParams } from '../validators/common';
import { scheduleBody } from '../validators/schedule.validators';

export class WorkScheduleController {
  constructor(private readonly schedules: WorkScheduleService) {}

  get = async (req: Request, res: Response): Promise<void> => {
    const { id } = idParams.parse(req.params);
    res.json(await this.schedules.get(id));
  };

  replace = async (req: Request, res: Response): Promise<void> => {
    const { id } = idParams.parse(req.params);
    res.json(await this.schedules.replace(id, scheduleBody.parse(req.body).shifts));
  };
}