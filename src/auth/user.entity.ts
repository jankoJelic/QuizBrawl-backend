import { ClassSerializerInterceptor, UseInterceptors } from '@nestjs/common';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { ApiHideProperty } from '@nestjs/swagger';
import { Quiz } from 'src/quizes/quiz.entity';
import { Topic } from 'src/rooms/types/Topic';

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
  refreshToken?: string;

  @ApiHideProperty()
  @Column()
  registrationOtpCode: string;

  @Column({ default: false })
  isPremium: boolean;

  @OneToMany(() => Quiz, (quiz) => quiz.user)
  quizes: Quiz[];

  @Column({ default: 0 })
  trophies: number;

  @Column({ default: '' })
  avatar: string;

  @Column({ default: 1 })
  level: number;

  @Column({
    type: 'json',
  })
  trophiesByTopic: Record<Topic, number>;

  @Column({ default: 0 })
  winPercentage: number;
}
