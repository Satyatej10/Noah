import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { QuizSession, QuizQuestion, QuizResult } from '../models/quiz.model';
import { FlashcardService } from './flashcard.service';
import { StorageService } from './storage.service';

@Injectable({
  providedIn: 'root',
})
export class QuizService {
  private readonly RESULTS_KEY = 'noah_quiz_results';

  private sessionSubject = new BehaviorSubject<QuizSession | null>(null);
  session$ = this.sessionSubject.asObservable();

  constructor(
    private flashcardService: FlashcardService,
    private storage: StorageService,
  ) {}

  generateQuiz(deckId: string, questionCount: number = 10): QuizSession | null {
    const deck = this.flashcardService.getDeckById(deckId);
    if (!deck) return null;

    const cards = this.flashcardService.getCardsForReview(deckId);
    const allCards: import('../models/flashcard.model').Flashcard[] = [];
    this.flashcardService
      .getCardsByDeck(deckId)
      .subscribe((c) => allCards.push(...c));

    const sourceCards = cards.length >= questionCount ? cards : allCards;
    const shuffled = [...sourceCards]
      .sort(() => Math.random() - 0.5)
      .slice(0, questionCount);

    if (shuffled.length === 0) return null;

    const questions: QuizQuestion[] = shuffled.map((card) => {
      const isMultipleChoice = Math.random() > 0.4;
      const wrongAnswers = allCards
        .filter((c) => c.id !== card.id)
        .sort(() => Math.random() - 0.5)
        .slice(0, 3)
        .map((c) => c.back);

      while (wrongAnswers.length < 3) {
        wrongAnswers.push('N/A');
      }

      const options = isMultipleChoice
        ? [...wrongAnswers, card.back].sort(() => Math.random() - 0.5)
        : [];

      return {
        id: Date.now().toString(36) + Math.random().toString(36).substr(2, 9),
        flashcardId: card.id,
        question: card.front,
        correctAnswer: card.back,
        options,
        type: isMultipleChoice
          ? ('multiple-choice' as const)
          : ('type-answer' as const),
      };
    });

    const session: QuizSession = {
      id: Date.now().toString(36) + Math.random().toString(36).substr(2, 9),
      deckId,
      deckName: deck.name,
      questions,
      currentIndex: 0,
      score: 0,
      totalQuestions: questions.length,
      startedAt: new Date().toISOString(),
      completedAt: null,
      isActive: true,
    };

    this.sessionSubject.next(session);
    return session;
  }

  answerQuestion(answer: string): boolean {
    const session = this.sessionSubject.getValue();
    if (!session || !session.isActive) return false;

    const question = session.questions[session.currentIndex];
    const isCorrect =
      answer.trim().toLowerCase() ===
      question.correctAnswer.trim().toLowerCase();

    question.userAnswer = answer;
    question.isCorrect = isCorrect;

    if (isCorrect) {
      session.score++;
    }

    // Update flashcard via spaced repetition
    this.flashcardService.reviewCard(question.flashcardId, isCorrect);

    session.currentIndex++;

    if (session.currentIndex >= session.totalQuestions) {
      session.isActive = false;
      session.completedAt = new Date().toISOString();
      this.saveResult(session);
    }

    this.sessionSubject.next({ ...session });
    return isCorrect;
  }

  getResults(): QuizResult[] {
    return this.storage.get<QuizResult[]>(this.RESULTS_KEY) || [];
  }

  getResultsByDeck(deckId: string): QuizResult[] {
    return this.getResults().filter((r) => r.deckId === deckId);
  }

  isQuizActive(): boolean {
    const session = this.sessionSubject.getValue();
    return session?.isActive || false;
  }

  endQuiz(): void {
    this.sessionSubject.next(null);
  }

  private saveResult(session: QuizSession): void {
    const startTime = new Date(session.startedAt).getTime();
    const endTime = new Date(session.completedAt!).getTime();

    const result: QuizResult = {
      id: session.id,
      deckId: session.deckId,
      deckName: session.deckName,
      score: session.score,
      totalQuestions: session.totalQuestions,
      percentage: Math.round((session.score / session.totalQuestions) * 100),
      completedAt: session.completedAt!,
      timeSpentSeconds: Math.round((endTime - startTime) / 1000),
    };

    const results = [...this.getResults(), result];
    this.storage.set(this.RESULTS_KEY, results);
  }
}
