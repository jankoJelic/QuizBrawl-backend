import { Topic } from 'src/rooms/types/Topic';
import { Difficulty } from '../types/difficulty.type';

export interface GetQuestionsDto {
  text?: string;
  topic?: Topic;
  difficulty?: Difficulty;
}
