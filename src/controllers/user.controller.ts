import { Request, Response } from 'express';
import { toUserDto } from '../dtos/mappers';
import { actorOf } from '../middlewares/auth.middleware';
import { UserService } from '../services/user.service';
import { createUserBody } from '../validators/user.validators';

export class UserController {
  constructor(private readonly users: UserService) {}

  me = async (req: Request, res: Response): Promise<void> => {
    res.json(toUserDto(await this.users.getById(actorOf(req).userId)));
  };

  create = async (req: Request, res: Response): Promise<void> => {
    const user = await this.users.create(createUserBody.parse(req.body));
    res.status(201).json(toUserDto(user));
  };
}