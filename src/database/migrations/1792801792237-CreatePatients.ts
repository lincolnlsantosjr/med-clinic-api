import { MigrationInterface, QueryRunner } from "typeorm";

export class CreatePatients1792801792237 implements MigrationInterface {
    name = 'CreatePatients1792801792237'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "patients" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, "cpf" character varying(11) NOT NULL, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP WITH TIME ZONE, CONSTRAINT "uq_patients_cpf" UNIQUE ("cpf"), CONSTRAINT "PK_a7f0b9fcbb3469d5ec0b0aceaa7" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "patients"`);
    }

}
