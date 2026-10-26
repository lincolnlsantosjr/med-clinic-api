import { Request, Response } from 'express';
import { toAppointmentDto, toCalendarItemDto } from '../dtos/mappers';
import { actorOf } from '../middlewares/auth.middleware';
import { AppointmentService } from '../services/appointment.service';
import { appointmentListQuery, calendarQuery, createAppointmentBody } from '../validators/appointment.validators';
import { idParams } from '../validators/common';

export class AppointmentController {
  constructor(private readonly appointments: AppointmentService) {}

  create = async (req: Request, res: Response): Promise<void> => {
    const appointment = await this.appointments.create(createAppointmentBody.parse(req.body));
    res.status(201).json(toAppointmentDto(appointment));
  };

  list = async (req: Request, res: Response): Promise<void> => {
    const result = await this.appointments.list(appointmentListQuery.parse(req.query), actorOf(req));
    res.json({ data: result.data.map(toAppointmentDto), meta: result.meta });
  };

  getById = async (req: Request, res: Response): Promise<void> => {
    const { id } = idParams.parse(req.params);
    res.json(toAppointmentDto(await this.appointments.getById(id, actorOf(req))));
  };

  calendar = async (req: Request, res: Response): Promise<void> => {
    const { id } = idParams.parse(req.params);
    const { from, to } = calendarQuery.parse(req.query);
    const result = await this.appointments.calendar(id, from, to);
    res.json({ workSchedule: { shifts: result.shifts }, appointments: result.appointments.map(toCalendarItemDto) });
  };
}