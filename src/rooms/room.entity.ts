import { IsString, MaxLength } from 'class-validator';
import { User } from 'src/auth/user.entity';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Room {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  createdBy: number;

  @IsString()
  @MaxLength(20)
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

  @Column()
  answerTime: number;

  @Column()
  type: 'brawl' | 'classic';
}
