export interface Flashcard {
  id: string;
  deckId: string;
  front: string;
  back: string;
  box: number; // Leitner box level 1-5
  nextReviewDate: string; // ISO date string
  createdAt: string;
  lastReviewedAt: string | null;
  timesCorrect: number;
  timesIncorrect: number;
}

export interface Deck {
  id: string;
  name: string;
  description: string;
  color: string;
  icon: string;
  createdAt: string;
  cardCount: number;
}
