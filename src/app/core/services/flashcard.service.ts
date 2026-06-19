import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, map } from 'rxjs';
import { Flashcard, Deck } from '../models/flashcard.model';
import { StorageService } from './storage.service';

@Injectable({
  providedIn: 'root',
})
export class FlashcardService {
  private readonly DECKS_KEY = 'noah_decks';
  private readonly CARDS_KEY = 'noah_flashcards';

  private decksSubject = new BehaviorSubject<Deck[]>([]);
  private cardsSubject = new BehaviorSubject<Flashcard[]>([]);

  decks$ = this.decksSubject.asObservable();
  cards$ = this.cardsSubject.asObservable();

  constructor(private storage: StorageService) {
    let decks = this.loadDecks();
    let cards = this.loadCards();
    if (decks.length === 0) {
      // Seed decks
      const angularDeck: Deck = {
        id: 'angular-core',
        name: 'Angular Core Concepts',
        description:
          'Key principles of Angular architecture: Components, Services, RxJS, and DI.',
        color: '#ef4444',
        icon: '💻',
        createdAt: new Date().toISOString(),
        cardCount: 4,
      };
      const rxjsDeck: Deck = {
        id: 'rxjs-ops',
        name: 'RxJS Operators',
        description:
          'Common reactive programming operators: switchMap, mergeMap, forkJoin, etc.',
        color: '#8b5cf6',
        icon: '🧠',
        createdAt: new Date().toISOString(),
        cardCount: 4,
      };
      decks = [angularDeck, rxjsDeck];
      this.storage.set(this.DECKS_KEY, decks);

      // Seed cards
      const seedCards: Flashcard[] = [
        {
          id: 'card-1',
          deckId: 'angular-core',
          front: 'What is a Standalone Component in Angular?',
          back: 'A component that does not require being declared in an NgModule. It manages its own imports list directly.',
          box: 1,
          nextReviewDate: new Date().toISOString(),
          createdAt: new Date().toISOString(),
          lastReviewedAt: null,
          timesCorrect: 0,
          timesIncorrect: 0,
        },
        {
          id: 'card-2',
          deckId: 'angular-core',
          front: 'What is Dependency Injection (DI)?',
          back: 'A design pattern where a class requests dependencies from external sources rather than creating them itself.',
          box: 1,
          nextReviewDate: new Date().toISOString(),
          createdAt: new Date().toISOString(),
          lastReviewedAt: null,
          timesCorrect: 0,
          timesIncorrect: 0,
        },
        {
          id: 'card-3',
          deckId: 'angular-core',
          front: 'What is the purpose of Route Guards?',
          back: 'Interfaces that run checks before navigating to or away from a route (e.g. CanActivate, CanDeactivate).',
          box: 1,
          nextReviewDate: new Date().toISOString(),
          createdAt: new Date().toISOString(),
          lastReviewedAt: null,
          timesCorrect: 0,
          timesIncorrect: 0,
        },
        {
          id: 'card-4',
          deckId: 'angular-core',
          front: 'What are Angular Signals?',
          back: 'A system that tracks state changes within an application, allowing Angular to optimize template rendering.',
          box: 1,
          nextReviewDate: new Date().toISOString(),
          createdAt: new Date().toISOString(),
          lastReviewedAt: null,
          timesCorrect: 0,
          timesIncorrect: 0,
        },
        {
          id: 'card-5',
          deckId: 'rxjs-ops',
          front: 'What is the difference between switchMap and mergeMap?',
          back: 'switchMap cancels the previous inner observable on new emits, while mergeMap runs all concurrently.',
          box: 1,
          nextReviewDate: new Date().toISOString(),
          createdAt: new Date().toISOString(),
          lastReviewedAt: null,
          timesCorrect: 0,
          timesIncorrect: 0,
        },
        {
          id: 'card-6',
          deckId: 'rxjs-ops',
          front: 'What does forkJoin do?',
          back: 'Waits for all source observables to complete and emits their last values as an array or object.',
          box: 1,
          nextReviewDate: new Date().toISOString(),
          createdAt: new Date().toISOString(),
          lastReviewedAt: null,
          timesCorrect: 0,
          timesIncorrect: 0,
        },
        {
          id: 'card-7',
          deckId: 'rxjs-ops',
          front: 'What is a BehaviorSubject?',
          back: 'A Subject variant that requires an initial value and emits the current value to new subscribers.',
          box: 1,
          nextReviewDate: new Date().toISOString(),
          createdAt: new Date().toISOString(),
          lastReviewedAt: null,
          timesCorrect: 0,
          timesIncorrect: 0,
        },
        {
          id: 'card-8',
          deckId: 'rxjs-ops',
          front: 'How does catchError handle stream errors?',
          back: 'Catches errors in the source observable and replaces them with a fallback observable or re-throws them.',
          box: 1,
          nextReviewDate: new Date().toISOString(),
          createdAt: new Date().toISOString(),
          lastReviewedAt: null,
          timesCorrect: 0,
          timesIncorrect: 0,
        },
      ];
      cards = seedCards;
      this.storage.set(this.CARDS_KEY, cards);
    }
    this.decksSubject.next(decks);
    this.cardsSubject.next(cards);
  }

  // Deck CRUD
  getDecks(): Observable<Deck[]> {
    return this.decks$;
  }

  getDeckById(id: string): Deck | undefined {
    return this.decksSubject.getValue().find((d) => d.id === id);
  }

  createDeck(deck: Omit<Deck, 'id' | 'createdAt' | 'cardCount'>): Deck {
    const newDeck: Deck = {
      ...deck,
      id: this.generateId(),
      createdAt: new Date().toISOString(),
      cardCount: 0,
    };
    const decks = [...this.decksSubject.getValue(), newDeck];
    this.saveDecks(decks);
    return newDeck;
  }

  updateDeck(id: string, updates: Partial<Deck>): void {
    const decks = this.decksSubject
      .getValue()
      .map((d) => (d.id === id ? { ...d, ...updates } : d));
    this.saveDecks(decks);
  }

  deleteDeck(id: string): void {
    const decks = this.decksSubject.getValue().filter((d) => d.id !== id);
    this.saveDecks(decks);
    // Also delete all cards in this deck
    const cards = this.cardsSubject.getValue().filter((c) => c.deckId !== id);
    this.saveCards(cards);
  }

  // Card CRUD
  getCardsByDeck(deckId: string): Observable<Flashcard[]> {
    return this.cards$.pipe(
      map((cards) => cards.filter((c) => c.deckId === deckId)),
    );
  }

  getCardsForReview(deckId: string): Flashcard[] {
    const now = new Date().toISOString();
    return this.cardsSubject
      .getValue()
      .filter((c) => c.deckId === deckId && c.nextReviewDate <= now)
      .sort((a, b) => a.box - b.box);
  }

  createCard(
    card: Omit<
      Flashcard,
      | 'id'
      | 'box'
      | 'nextReviewDate'
      | 'createdAt'
      | 'lastReviewedAt'
      | 'timesCorrect'
      | 'timesIncorrect'
    >,
  ): Flashcard {
    const newCard: Flashcard = {
      ...card,
      id: this.generateId(),
      box: 1,
      nextReviewDate: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      lastReviewedAt: null,
      timesCorrect: 0,
      timesIncorrect: 0,
    };
    const cards = [...this.cardsSubject.getValue(), newCard];
    this.saveCards(cards);
    this.updateDeckCardCount(card.deckId);
    return newCard;
  }

  updateCard(id: string, updates: Partial<Flashcard>): void {
    const cards = this.cardsSubject
      .getValue()
      .map((c) => (c.id === id ? { ...c, ...updates } : c));
    this.saveCards(cards);
  }

  deleteCard(id: string): void {
    const card = this.cardsSubject.getValue().find((c) => c.id === id);
    const cards = this.cardsSubject.getValue().filter((c) => c.id !== id);
    this.saveCards(cards);
    if (card) {
      this.updateDeckCardCount(card.deckId);
    }
  }

  reviewCard(id: string, correct: boolean): void {
    const card = this.cardsSubject.getValue().find((c) => c.id === id);
    if (!card) return;

    const newBox = correct ? Math.min(card.box + 1, 5) : 1;
    const reviewIntervals: Record<number, number> = {
      1: 1,
      2: 3,
      3: 7,
      4: 14,
      5: 30,
    };
    const nextDate = new Date();
    nextDate.setDate(nextDate.getDate() + (reviewIntervals[newBox] || 1));

    this.updateCard(id, {
      box: newBox,
      nextReviewDate: nextDate.toISOString(),
      lastReviewedAt: new Date().toISOString(),
      timesCorrect: correct ? card.timesCorrect + 1 : card.timesCorrect,
      timesIncorrect: correct ? card.timesIncorrect : card.timesIncorrect + 1,
    });
  }

  getBoxDistribution(): number[] {
    const cards = this.cardsSubject.getValue();
    const dist = [0, 0, 0, 0, 0];
    cards.forEach((c) => {
      if (c.box >= 1 && c.box <= 5) dist[c.box - 1]++;
    });
    return dist;
  }

  private updateDeckCardCount(deckId: string): void {
    const count = this.cardsSubject
      .getValue()
      .filter((c) => c.deckId === deckId).length;
    this.updateDeck(deckId, { cardCount: count });
  }

  private loadDecks(): Deck[] {
    return this.storage.get<Deck[]>(this.DECKS_KEY) || [];
  }

  private loadCards(): Flashcard[] {
    return this.storage.get<Flashcard[]>(this.CARDS_KEY) || [];
  }

  private saveDecks(decks: Deck[]): void {
    this.storage.set(this.DECKS_KEY, decks);
    this.decksSubject.next(decks);
  }

  private saveCards(cards: Flashcard[]): void {
    this.storage.set(this.CARDS_KEY, cards);
    this.cardsSubject.next(cards);
  }

  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
  }
}
