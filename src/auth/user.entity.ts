import { ClassSerializerInterceptor, UseInterceptors } from '@nestjs/common';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ApiHideProperty } from '@nestjs/swagger';

@UseInterceptors(ClassSerializerInterceptor)
@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column({ unique: true })
  email: string;

  @Column({ default: false })
  isEmailConfirmed: boolean;

  @ApiHideProperty()
  @Column({ default: false })
  isAdmin: boolean;

  @ApiHideProperty()
  @Column()
  password: string;

  @CreateDateColumn({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP(6)',
  })
  createdAt: Date;

  @UpdateDateColumn({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP(6)',
    onUpdate: 'CURRENT_TIMESTAMP(6)',
  })
  updatedAt: Date;

  @ApiHideProperty()
  @Column({ nullable: true })
  // @Exclude()
  refreshToken?: string;
}
