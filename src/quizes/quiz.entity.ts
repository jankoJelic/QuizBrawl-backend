import { User } from 'src/auth/user.entity';
import { Question } from 'src/questions/question.entity';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Quiz {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ type: 'json' })
  questions: Question[];

  @Column({ default: 15 })
  answerTime: number;

  @ManyToOne(() => User, (user) => user.quizes)
  user: User;

  @Column({ nullable: true })
  userId: number;
}
