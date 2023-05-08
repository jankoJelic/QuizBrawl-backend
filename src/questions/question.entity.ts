import { IsNumber, IsString, MaxLength, Min } from 'class-validator';
import { Topic } from 'src/rooms/types/Topic';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { CorrectAnswer } from './types/correct-answer.type';
import { Difficulty } from './types/difficulty.type';
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

  @Column({ default: null })
  image?: string;

  @ManyToOne(() => User, (user) => user.questions)
  user: User;

  @Column({ type: 'json', nullable: true })
  editedBy: User[];

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

  @IsNumber()
  @Min(0)
  @Column({ default: 0 })
  likes: number;

  @IsNumber()
  @Min(0)
  @Column({ default: 0 })
  dislikes: number;
}
