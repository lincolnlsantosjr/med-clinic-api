import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateWorkShifts1793054367649 implements MigrationInterface {
    name = 'CreateWorkShifts1793054367649'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "work_shifts" ("id" SERIAL NOT NULL, "doctorId" integer NOT NULL, "weekDay" integer NOT NULL, "startTime" character varying(5) NOT NULL, "endTime" character varying(5) NOT NULL, "slotDurationMinutes" integer NOT NULL, CONSTRAINT "PK_30826a4f3460a48369193453043" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "work_shifts" ADD CONSTRAINT "FK_b8cc124b78f1674b990ddb17b39" FOREIGN KEY ("doctorId") REFERENCES "doctors"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "work_shifts" DROP CONSTRAINT "FK_b8cc124b78f1674b990ddb17b39"`);
        await queryRunner.query(`DROP TABLE "work_shifts"`);
    }

}
