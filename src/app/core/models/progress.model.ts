export interface StudySession {
  id: string;
  type: 'pomodoro' | 'flashcard' | 'quiz';
  durationMinutes: number;
  date: string;
  completedAt: string;
}

export interface DailyProgress {
  date: string;
  studyMinutes: number;
  cardsReviewed: number;
  quizzesTaken: number;
  averageScore: number;
}

export interface UserStats {
  totalStudyMinutes: number;
  totalCardsReviewed: number;
  totalQuizzesTaken: number;
  currentStreak: number;
  longestStreak: number;
  cardsInBox: number[];
  averageQuizScore: number;
}
