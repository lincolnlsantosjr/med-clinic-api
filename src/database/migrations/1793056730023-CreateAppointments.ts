import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateAppointments1793056730023 implements MigrationInterface {
    name = 'CreateAppointments1793056730023'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "appointments" ("id" SERIAL NOT NULL, "doctorId" integer NOT NULL, "patientId" integer NOT NULL, "startsAt" TIMESTAMP WITH TIME ZONE NOT NULL, "endsAt" TIMESTAMP WITH TIME ZONE NOT NULL, "status" character varying(20) NOT NULL DEFAULT 'scheduled', "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_4a437a9a27e948726b8bb3e36ad" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "idx_appointments_patient_start" ON "appointments"  ("patientId", "startsAt") `);
        await queryRunner.query(`CREATE INDEX "idx_appointments_doctor_start" ON "appointments"  ("doctorId", "startsAt") `);
        await queryRunner.query(`ALTER TABLE "appointments" ADD CONSTRAINT "FK_0c1af27b469cb8dca420c160d65" FOREIGN KEY ("doctorId") REFERENCES "doctors"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "appointments" ADD CONSTRAINT "FK_13c2e57cb81b44f062ba24df57d" FOREIGN KEY ("patientId") REFERENCES "patients"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "appointments" DROP CONSTRAINT "FK_13c2e57cb81b44f062ba24df57d"`);
        await queryRunner.query(`ALTER TABLE "appointments" DROP CONSTRAINT "FK_0c1af27b469cb8dca420c160d65"`);
        await queryRunner.query(`DROP INDEX "public"."idx_appointments_doctor_start"`);
        await queryRunner.query(`DROP INDEX "public"."idx_appointments_patient_start"`);
        await queryRunner.query(`DROP TABLE "appointments"`);
    }

}
