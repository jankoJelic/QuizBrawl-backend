import { User } from 'src/auth/user.entity';
import { Question } from 'src/questions/question.entity';
import { Topic } from 'src/rooms/types/Topic';
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

  @Column({ default: 'General' })
  topic: Topic;

  @Column({ default: 0 })
  likes: number;

  @Column({ default: 0 })
  dislikes: number;

  @Column({ type: 'json', nullable: true })
  leagueIds: number[];
}
