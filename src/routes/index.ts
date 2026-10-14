import { Router } from 'express';
import type { Controllers } from '../container';
import { authenticate, authorize } from '../middlewares/auth.middleware';

export function buildRoutes(c: Controllers): Router {
  const router = Router();

  router.get('/health', (_req, res) => {
    res.json({ status: 'ok' });
  });
  router.post('/auth/login', c.auth.login);

  router.use(authenticate);

  router.get('/users/me', c.users.me);
  router.post('/users', authorize('admin'), c.users.create);

  return router;
}