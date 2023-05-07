import { CorrectAnswer } from 'src/questions/types/correct-answer.type';

export interface SelectAnswerDto {
  answer: CorrectAnswer;
  roomId: number;
  userId: number;
}
