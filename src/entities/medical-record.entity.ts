import { Column, CreateDateColumn, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { MedicalRecordModel } from '../domain/types';
import { Doctor } from './doctor.entity';
import { Patient } from './patient.entity';

@Entity('medical_records')
@Index('idx_records_patient_created', ['patientId', 'createdAt'])
export class MedicalRecord implements MedicalRecordModel {
  @PrimaryGeneratedColumn() id!: number;
  @Column() patientId!: number;
  @ManyToOne(() => Patient, { nullable: false }) @JoinColumn({ name: 'patientId' }) patient!: Patient;
  @Column() doctorId!: number;
  @ManyToOne(() => Doctor, { nullable: false }) @JoinColumn({ name: 'doctorId' }) doctor!: Doctor;
  @Column({ type: 'text' }) text!: string;
  @CreateDateColumn({ type: 'timestamptz' }) createdAt!: Date;
}