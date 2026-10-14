import express, { Express } from 'express';
import type { Controllers } from './container';
import { errorHandler, notFoundHandler } from './middlewares/error.middleware';
import { buildRoutes } from './routes';

export function createApp(controllers: Controllers): Express {
  const app = express();
  app.disable('x-powered-by');
  app.use(express.json());
  app.use('/api/v1', buildRoutes(controllers));
  app.use(notFoundHandler);
  app.use(errorHandler);
  return app;
}