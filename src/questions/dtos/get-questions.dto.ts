import { Topic } from 'src/rooms/types/Topic';
import { Difficulty } from '../types/difficulty.type';

export interface GetQuestionsDto {
  length: number;
  topic: Topic;
  difficulty?: Difficulty;
  image?: string;
}
