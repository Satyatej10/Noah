export interface QuizQuestion {
  id: string;
  flashcardId: string;
  question: string;
  correctAnswer: string;
  options: string[]; // For multiple choice
  type: 'multiple-choice' | 'type-answer';
  userAnswer?: string;
  isCorrect?: boolean;
}

export interface QuizSession {
  id: string;
  deckId: string;
  deckName: string;
  questions: QuizQuestion[];
  currentIndex: number;
  score: number;
  totalQuestions: number;
  startedAt: string;
  completedAt: string | null;
  isActive: boolean;
}

export interface QuizResult {
  id: string;
  deckId: string;
  deckName: string;
  score: number;
  totalQuestions: number;
  percentage: number;
  completedAt: string;
  timeSpentSeconds: number;
}
