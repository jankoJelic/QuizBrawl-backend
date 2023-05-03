import { IsNumber, IsString, Max, MaxLength, Min } from 'class-validator';
import { Topic } from 'src/rooms/types/Topic';
import {
  Column,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { CorrectAnswer } from './types/correct-answer.type';
import { Difficulty } from './types/difficulty.type';
import { Image } from 'src/images/image.entity';
import { User } from 'src/auth/user.entity';

@Entity()
export class Question {
  @PrimaryGeneratedColumn()
  id: number;

  @IsString()
  @MaxLength(255)
  @Column()
  question: string;

  @Column()
  answer1: string;

  @Column()
  answer2: string;

  @Column()
  answer3: string;

  @Column()
  answer4: string;

  @Column()
  correctAnswer: CorrectAnswer;

  @Column()
  topic: Topic;

  @Column({ default: 'EASY' })
  difficulty: Difficulty;

  @Column({ default: 0 })
  answer1Count: number;

  @Column({ default: 0 })
  answer2Count: number;

  @Column({ default: 0 })
  answer3Count: number;

  @Column({ default: 0 })
  answer4Count: number;

  @OneToOne(() => Image, (image) => image.question)
  image: Image;

  @ManyToOne(() => User, (user) => user.questions)
  user: User;
}
