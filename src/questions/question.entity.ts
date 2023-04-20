import { IsNumber, IsString, Max, MaxLength, Min } from 'class-validator';
import { Topic } from 'src/rooms/types/Topic';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { CorrectAnswer } from './types/correct-answer.type';
import { Difficulty } from './types/difficulty.type';

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

  @Column()
  difficulty: Difficulty;

  @Column({ default: '' })
  image: string;

  @Column({ default: 0 })
  answer1Count: number;

  @Column({ default: 0 })
  answer2Count: number;

  @Column({ default: 0 })
  answer3Count: number;

  @Column({ default: 0 })
  answer4Count: number;
}
