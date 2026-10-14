import 'reflect-metadata';
import { createApp } from './app';
import { env } from './config/env';
import { buildControllers } from './container';
import { AppDataSource } from './database/data-source';

async function main(): Promise<void> {
  await AppDataSource.initialize();
  await AppDataSource.runMigrations();
  const app = createApp(buildControllers(AppDataSource));
  app.listen(env.port, '0.0.0.0', () => console.log(`MedClinic API na porta ${env.port}`));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});