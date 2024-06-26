import { ClassSerializerInterceptor, UseInterceptors } from '@nestjs/common';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { ApiHideProperty } from '@nestjs/swagger';
import { Quiz } from 'src/quizes/quiz.entity';
import { Topic } from 'src/rooms/types/Topic';
import { Room } from 'src/rooms/room.entity';
import { Lobby } from 'src/lobbies/lobby.entity';
import { Question } from 'src/questions/question.entity';
import { IsNumber, Max, Min } from 'class-validator';
import { Team } from 'src/teams/team.entity';
import { Reward } from './dtos/reward.dto';

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
  @Column({ default: '' })
  registrationOtpCode: string;

  @Column({ default: false })
  isPremium: boolean;

  @Column({ type: 'datetime', nullable: true })
  premiumUntil: Date;

  @Column({ default: false })
  premiumSubscriptionActive: boolean;

  @OneToMany(() => Quiz, (quiz) => quiz.user, { eager: true })
  @JoinColumn()
  quizes: Quiz[];

  @IsNumber()
  @Min(0)
  @Column({ default: 0 })
  trophies: number;

  @Column({ default: '' })
  avatar: string;

  @Column({ type: 'json', nullable: true })
  avatars: string[];

  @Column({ default: '#ECECEC' })
  color: string;

  @Column({ type: 'json', nullable: true })
  teamAvatars: string[];

  @Column({ default: 1 })
  level: number;

  @Column({
    type: 'json',
    nullable: true,
  })
  trophiesByTopic: Record<Topic, number>;

  @IsNumber()
  @Min(0)
  @Max(100)
  @Column({ default: 0 })
  accuracyPercentage: number;

  @Column({
    type: 'json',
    nullable: true,
  })
  totalAnswers: Record<Topic, number>;

  @Column({ type: 'json', nullable: true })
  correctAnswers: Record<Topic, number>;

  @IsNumber()
  @Min(0)
  @Column({ default: 0 })
  rank: number;

  @IsNumber()
  @Min(0)
  @Column({ default: 0 })
  money: number;

  @IsNumber()
  @Min(0)
  @Column({ default: 0 })
  maxTrophies: number;

  @ManyToOne(() => Lobby, (lobby) => lobby.users)
  lobby: Lobby;

  @ManyToOne(() => Room, (room) => room.users, { onDelete: 'SET NULL' })
  room: Room;

  @OneToMany(() => Question, (question) => question.user)
  questions: Question[];

  @Column({ default: false })
  isBanned: boolean;

  @IsNumber()
  @Min(0)
  @Column({ default: 0 }) // this is not yet handled in any way, same as levels
  experience: number;

  @Column({ default: '' })
  country: string;

  @Column({ type: 'json', nullable: true })
  friends: number[];

  @ManyToOne(() => Team, (team) => team.users)
  team: Team;

  @Column({ default: 'General' })
  favouriteTopic: Topic;

  @Column({ type: 'json', nullable: true })
  friendRequests: [];

  @Column({ default: '' })
  googleAuthId: string;

  @Column({ default: '' })
  appleId: string;

  @Column({ default: false })
  securedWithPin: boolean;

  @Column({ default: '' })
  fcmToken: string;

  @Column({ default: true })
  isOnline: boolean;

  @Column({ type: 'json', nullable: true })
  achievements: Reward[];

  @Column({ type: 'json', nullable: true })
  rewards: Reward[];

  @Column({ type: 'json', nullable: true })
  dailies: {};

  @Column({ type: 'json', nullable: true })
  leagueIds: number[];

  @Column({ default: false })
  isBot: boolean;
}
