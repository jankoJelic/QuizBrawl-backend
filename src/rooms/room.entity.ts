import { IsString, MaxLength } from 'class-validator';
import { User } from 'src/auth/user.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
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

  @Column()
  hostName: string;

  @IsString()
  @MaxLength(24)
  @Column()
  name: string;

  @Column({ type: 'json' })
  players: Partial<User>[];
  //@IsOptional() => in DTO
  // @ApiModelProperty({
  //   isArray: true,
  // })
  // dependants: User[];

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
}
