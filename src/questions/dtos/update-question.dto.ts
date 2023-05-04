import { User } from 'src/auth/user.entity';
import { CreateQuestionDto } from './create-question.dto';

export interface UpdateQuestionDto {
  user: User;
  dto: Partial<CreateQuestionDto>;
  id: number;
}
