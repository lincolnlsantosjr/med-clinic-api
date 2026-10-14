import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, Unique } from 'typeorm';
import { Role, UserModel } from '../domain/types';

@Entity('users')
@Unique('uq_users_email', ['email'])
export class User implements UserModel {
  @PrimaryGeneratedColumn() id!: number;
  @Column() name!: string;
  @Column() email!: string;
  @Column() passwordHash!: string;
  @Column('text', { array: true }) roles!: Role[];
  @CreateDateColumn({ type: 'timestamptz' }) createdAt!: Date;
}