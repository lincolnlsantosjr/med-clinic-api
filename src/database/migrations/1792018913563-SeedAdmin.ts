import { MigrationInterface, QueryRunner } from "typeorm";
import { hash } from 'bcryptjs';

export class SeedAdmin1792018913563 implements MigrationInterface {


  public async up(queryRunner: QueryRunner): Promise<void> {
    const email = process.env.ADMIN_EMAIL?.toLowerCase();
    const password = process.env.ADMIN_PASSWORD;
    if (!email || !password) throw new Error('ADMIN_EMAIL e ADMIN_PASSWORD são obrigatórios para o seed.');
    const passwordHash = await hash(password, 10);
    await queryRunner.query(
      `INSERT INTO "users" ("name","email","passwordHash","roles") VALUES ($1,$2,$3,$4)
       ON CONFLICT ("email") DO NOTHING`,
      [process.env.ADMIN_NAME ?? 'Administrador', email, passwordHash, ['admin']],
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DELETE FROM "users" WHERE "email" = $1`, [process.env.ADMIN_EMAIL?.toLowerCase()]);
  }
}


