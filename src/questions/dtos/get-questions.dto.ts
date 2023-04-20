import { Topic } from 'src/rooms/types/Topic';

export interface GetQuestionsDto {
  length: number;
  topic: Topic;
  difficulty?: number;
  image?: string;
}
