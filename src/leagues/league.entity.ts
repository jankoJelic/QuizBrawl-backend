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
}
