import { Column, CreateDateColumn, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { AppointmentModel, AppointmentStatus } from '../domain/types';
import { Doctor } from './doctor.entity';
import { Patient } from './patient.entity';

@Entity('appointments')
@Index('idx_appointments_doctor_start', ['doctorId', 'startsAt'])
@Index('idx_appointments_patient_start', ['patientId', 'startsAt'])
export class Appointment implements AppointmentModel {
  @PrimaryGeneratedColumn() id!: number;
  @Column() doctorId!: number;
  @ManyToOne(() => Doctor, { nullable: false }) @JoinColumn({ name: 'doctorId' }) doctor!: Doctor;
  @Column() patientId!: number;
  @ManyToOne(() => Patient, { nullable: false }) @JoinColumn({ name: 'patientId' }) patient!: Patient;
  @Column({ type: 'timestamptz' }) startsAt!: Date;
  @Column({ type: 'timestamptz' }) endsAt!: Date;
  @Column({ type: 'varchar', length: 20, default: 'scheduled' }) status!: AppointmentStatus;
  @CreateDateColumn({ type: 'timestamptz' }) createdAt!: Date;
}