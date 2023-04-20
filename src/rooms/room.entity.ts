import { IsString, MaxLength } from 'class-validator';
import { User } from 'src/auth/user.entity';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { GameType } from './types/GameType';

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
}
