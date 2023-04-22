import { IsString, MaxLength } from 'class-validator';
import { User } from 'src/auth/user.entity';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { GameType } from './types/GameType';
import { Lobby } from 'src/lobbies/lobby.entity';

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

  @Column({ default: 'general' })
  topic: string;

  @Column({ default: 15 })
  answerTime: number;

  @Column()
  type: GameType;

  @Column({ default: '' })
  password: string;

  @ManyToOne(() => Lobby, (lobby) => lobby.rooms)
  lobby: Lobby;
}
