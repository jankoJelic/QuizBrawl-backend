import { CorrectAnswer } from '../types/correct-answer.type';
import { Difficulty } from '../types/difficulty.type';

export interface CreateQuestionDto {
  question: string;
  answer1: string;
  answer2: string;
  answer3: string;
  answer4: string;
  correctAnswer: CorrectAnswer;
  difficulty: Difficulty;
  image?: string;
}
