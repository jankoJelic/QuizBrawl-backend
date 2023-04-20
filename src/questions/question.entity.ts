import { IsNumber, IsString, Max, MaxLength, Min } from 'class-validator';
import { Topic } from 'src/rooms/types/Topic';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { CorrectAnswer } from './types/correct-answer.type';

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

  @IsNumber()
  @Max(10)
  @Min(1)
  @Column()
  difficulty: number;

  @Column({ default: '' })
  image: string;
}
