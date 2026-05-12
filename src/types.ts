export interface Word {
  id: string;
  word: string;
  phonetic: string;
  pos: string;
  meaning: string;
  letter: string;
}

export type DatasetKey = "middle-school" | "primary-school";

export type RouteKey =
  | "middle-school"
  | "primary-school"
  | "docs/middle-school"
  | "docs/primary-school";

export type Locale = "zh" | "en";

export interface QuizQuestion {
  wordId: string;
  word: string;
  correctAnswer: string;
  options: string[];
  userAnswer?: string;
  isCorrect?: boolean;
}

export interface QuizResult {
  totalQuestions: number;
  correctAnswers: number;
  accuracy: number;
  questions: QuizQuestion[];
}
