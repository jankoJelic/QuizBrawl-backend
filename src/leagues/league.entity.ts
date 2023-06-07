import { ClassSerializerInterceptor, UseInterceptors } from '@nestjs/common';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ShallowUser } from 'src/auth/util/shallowUser';
import { LeagueType } from './dtos/league.type';
import { Reward } from 'src/auth/dtos/reward.dto';

@UseInterceptors(ClassSerializerInterceptor)
@Entity()
export class League {
  @PrimaryGeneratedColumn()
  id: number;

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

  @Column()
  name: string;

  @Column({ type: 'json', nullable: true })
  score: Record<number, number>;

  @Column({ type: 'json', nullable: true })
  users: ShallowUser[];

  @Column()
  userId: number;

  @Column()
  image: string;

  @Column({ default: 'ADMIN' })
  type: LeagueType;

  @Column({ type: 'json', nullable: true })
  reward: Reward;

  @Column({ type: 'json', nullable: true })
  gamesPlayed: Record<number, number>;

  @Column({ type: 'json', nullable: true })
  correctAnswers: Record<number, number>;

  @Column({ type: 'json', nullable: true })
  totalAnswers: Record<number, number>;

  @Column({ default: 0 })
  bet: number;

  @Column({ default: '' })
  password: string;

  @Column({ type: 'json', nullable: true })
  quizIds: number[];

  @Column()
  nextQuizUserId: number;

  @Column({ type: 'json', nullable: true })
  playedQuizIds: number[];

  @Column({ type: 'json', nullable: true })
  readyUsers: number[];

  @Column({ default: 0 })
  selectedQuizId: number;

  @Column({ default: false })
  gameInProgress: boolean;

  @Column({ default: 15 })
  answerTime: number;

  @Column({ default: 10 })
  questionsCount: number;
}
