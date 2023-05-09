import { IsString, MaxLength } from 'class-validator';
import { User } from 'src/auth/user.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { GameType } from './types/GameType';
import { Lobby } from 'src/lobbies/lobby.entity';
import { Topic } from './types/Topic';

@Entity()
export class Room {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  userId: number;

  @IsString()
  @MaxLength(24)
  @Column()
  name: string;

  @Column({ default: 4 })
  maxPlayers: number;

  @Column({ default: 15 })
  questionsCount: number;

  @Column({ default: 'General' })
  topic: Topic;

  @Column({ default: 15 })
  answerTime: number;

  @Column({ default: 'brawl' })
  type: GameType;

  @Column({ default: '' })
  password: string;

  @ManyToOne(() => Lobby, (lobby) => lobby.rooms)
  @JoinColumn()
  lobby: Lobby;

  @OneToMany(() => User, (user) => user.room, { eager: true })
  @JoinColumn()
  users: User[];

  @Column({ type: 'json' })
  admin: User;

  @Column({ type: 'json', nullable: true,  })
  readyUsers: string[];
}
