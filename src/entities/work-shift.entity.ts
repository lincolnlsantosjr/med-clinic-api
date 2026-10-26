import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { ShiftModel } from '../domain/types';
import { Doctor } from './doctor.entity';

@Entity('work_shifts')
export class WorkShift implements ShiftModel {
  @PrimaryGeneratedColumn() id!: number;
  @Column() doctorId!: number;
  @ManyToOne(() => Doctor, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'doctorId' })
  doctor!: Doctor;
  @Column({ type: 'int' }) weekDay!: number;
  @Column({ type: 'varchar', length: 5 }) startTime!: string;
  @Column({ type: 'varchar', length: 5 }) endTime!: string;
  @Column({ type: 'int' }) slotDurationMinutes!: number;
}