import { Difficulty } from './difficulty.type';

export interface TriviaApiQuestion {
  category: TriviaQuestionCategory;
  id: string;
  correctAnswer: string;
  incorrectAnswers: string[];
  question: {
    text: string;
  };
  tags: string[];
  type: 'text_choice';
  difficulty: Difficulty;
  regions: [];
  isNiche: boolean;
}

export type TriviaQuestionCategory =
  | 'food_and_drink'
  | 'music'
  | 'film_and_tv'
  | 'history'
  | 'geography'
  | 'sport_and_leisure'
  | 'society_and_culture'
  | 'general_knowledge'
  | 'arts_and_literature'
  | 'science';
