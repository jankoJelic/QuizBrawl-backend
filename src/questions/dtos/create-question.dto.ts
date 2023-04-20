import { CorrectAnswer } from '../types/correct-answer.type';

export interface CreateQuestionDto {
  question: string;
  answer1: string;
  answer2: string;
  answer3: string;
  answer4: string;
  correctAnswer: CorrectAnswer;
  difficulty: number;
  image?: string;
}
