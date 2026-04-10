export interface Word {
  id: number;
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
  wordId: number;
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
