import { Topic } from 'src/rooms/types/Topic';
import { CorrectAnswer } from '../types/correct-answer.type';
import { Difficulty } from '../types/difficulty.type';
import { Image } from 'src/images/image.entity';
import { User } from 'src/auth/user.entity';

export interface CreateQuestionDto {
  question: string;
  answer1: string;
  answer2: string;
  answer3: string;
  answer4: string;
  correctAnswer: CorrectAnswer;
  difficulty: Difficulty;
  image?: Image;
  topic: Topic;
  user: User;
}
