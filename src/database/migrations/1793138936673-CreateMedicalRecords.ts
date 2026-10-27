import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateMedicalRecords1793138936673 implements MigrationInterface {
    name = 'CreateMedicalRecords1793138936673'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "medical_records" ("id" SERIAL NOT NULL, "patientId" integer NOT NULL, "doctorId" integer NOT NULL, "text" text NOT NULL, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_c200c0b76638124b7ed51424823" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "idx_records_patient_created" ON "medical_records"  ("patientId", "createdAt") `);
        await queryRunner.query(`ALTER TABLE "medical_records" ADD CONSTRAINT "FK_7c2c9d4fe663e3330d503bf4407" FOREIGN KEY ("patientId") REFERENCES "patients"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "medical_records" ADD CONSTRAINT "FK_fb2a8c47032fe6f18e9266951df" FOREIGN KEY ("doctorId") REFERENCES "doctors"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "medical_records" DROP CONSTRAINT "FK_fb2a8c47032fe6f18e9266951df"`);
        await queryRunner.query(`ALTER TABLE "medical_records" DROP CONSTRAINT "FK_7c2c9d4fe663e3330d503bf4407"`);
        await queryRunner.query(`DROP INDEX "public"."idx_records_patient_created"`);
        await queryRunner.query(`DROP TABLE "medical_records"`);
    }

}
