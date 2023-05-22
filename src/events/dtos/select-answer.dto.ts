import { CorrectAnswer } from 'src/questions/types/correct-answer.type';
import { Topic } from 'src/rooms/types/Topic';

export interface SelectAnswerDto {
  answer: CorrectAnswer;
  roomId: number;
  userId: number;
  topic: Topic;
}
