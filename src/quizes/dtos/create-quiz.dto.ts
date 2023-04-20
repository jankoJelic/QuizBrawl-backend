import { User } from 'src/auth/user.entity';
import { Question } from 'src/questions/question.entity';

export class CreateQuizDto {
  name: string;
  questions: Question[];
  answerTime: number;
  user: User;
}
