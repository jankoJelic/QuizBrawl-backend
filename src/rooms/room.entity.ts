import { IsString, MaxLength } from 'class-validator';
import { User } from 'src/auth/user.entity';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Room {
  @PrimaryGeneratedColumn()
  id: number;

  @IsString()
  @MaxLength(20)
  @Column()
  name: string;

  @Column()
  players: User[];

  @Column({ default: 4 })
  maxPlayers: number;

  @Column()
  questionsCount: number;

  @Column({ default: 'general' })
  topic: string;

  @Column({ default: 15 })
  answerTime: number;
}
