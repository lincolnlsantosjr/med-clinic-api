import { Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn, Unique } from 'typeorm';
import { DoctorModel } from '../domain/types';
import { User } from './user.entity';

@Entity('doctors')
@Unique('uq_doctors_crm', ['crm'])
export class Doctor implements DoctorModel {
  @PrimaryGeneratedColumn() id!: number;
  @Column() crm!: string;
  @OneToOne(() => User, { eager: true, nullable: false })
  @JoinColumn()
  user!: User;
}