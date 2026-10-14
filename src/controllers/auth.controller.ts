import { Request, Response } from 'express';
import { AuthService } from '../services/auth.service';
import { loginBody } from '../validators/user.validators';

export class AuthController {
  constructor(private readonly auth: AuthService) {}

login = async (req: Request, res: Response): Promise<void> => {
  console.log('logou');

  const { email, password } = loginBody.parse(req.body);
  res.status(200).json(await this.auth.login(email, password));
};
}