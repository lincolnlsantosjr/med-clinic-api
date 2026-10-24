import { Column, CreateDateColumn, DeleteDateColumn, Entity, PrimaryGeneratedColumn, Unique } from 'typeorm';
import { PatientModel } from '../domain/types';

@Entity('patients')
@Unique('uq_patients_cpf', ['cpf'])
export class Patient implements PatientModel {
  @PrimaryGeneratedColumn() id!: number;
  @Column() name!: string;
  @Column({ type: 'varchar', length: 11 }) cpf!: string;
  @CreateDateColumn({ type: 'timestamptz' }) createdAt!: Date;
  @DeleteDateColumn({ type: 'timestamptz' }) deletedAt!: Date | null;
}