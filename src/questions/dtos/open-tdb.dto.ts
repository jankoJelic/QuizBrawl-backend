export interface OpenTDBQuestion {
  category: OpenTDBCategory;
  type: string; // multiple
  difficulty: 'easy' | 'medium' | 'hard';
  question: string;
  correct_answer: string;
  incorrect_answers: string[];
}

export type OpenTDBCategory =
  | 'Mythology' // Art
  | 'History' // History
  | 'Animals' // Science
  | 'Entertainment: Comics'
  | 'Entertainment: Video Games'
  | 'Entertainment: Television' // showbiz
  | 'Entertainment: Film' // showbiz
  | 'Entertainment: Books' // Art
  | 'Entertainment: Music' // Music
  | 'Geography' // Geography
  | 'Science: Mathematics' // Science
  | 'Science: Computers' // Science
  | 'Science & Nature' // Science
  | 'General Knowledge' // General
  | 'Vehicles'; // General
