import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormsModule,
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FlashcardService } from '../../core/services/flashcard.service';
import { Deck, Flashcard } from '../../core/models/flashcard.model';
import { ConfirmDialogComponent } from '../../shared/components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-flashcards',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule,
    ConfirmDialogComponent,
  ],
  templateUrl: './flashcards.component.html',
  styleUrls: ['./flashcards.component.css'],
})
export class FlashcardsComponent implements OnInit {
  private fb = inject(FormBuilder);
  private flashcardService = inject(FlashcardService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  decks: Deck[] = [];
  selectedDeck: Deck | null = null;
  cards: Flashcard[] = [];
  reviewQueue: Flashcard[] = [];
  currentReviewIndex = 0;
  isFlipped = false;

  // Modals / Modes
  viewMode: 'list-decks' | 'view-deck' | 'review' = 'list-decks';
  isDeckModalOpen = false;
  isCardModalOpen = false;
  isConfirmDialogOpen = false;
  confirmType: 'deck' | 'card' = 'deck';
  itemToDeleteId = '';

  // Forms
  deckForm!: FormGroup;
  cardForm!: FormGroup;

  colors = ['#6366f1', '#14b8a6', '#f59e0b', '#ef4444', '#ec4899', '#8b5cf6'];
  icons = ['📚', '💻', '🧪', '🌍', '🎨', '🧠', '⚙️', '📈'];

  ngOnInit(): void {
    this.initForms();
    this.flashcardService.getDecks().subscribe((decks) => {
      this.decks = decks;
      this.checkRouteParams();
    });
  }

  initForms(): void {
    this.deckForm = this.fb.group({
      name: ['', [Validators.required, Validators.maxLength(30)]],
      description: ['', [Validators.maxLength(100)]],
      color: [this.colors[0], Validators.required],
      icon: [this.icons[0], Validators.required],
    });

    this.cardForm = this.fb.group({
      front: ['', [Validators.required]],
      back: ['', [Validators.required]],
    });
  }

  checkRouteParams(): void {
    this.route.paramMap.subscribe((params) => {
      const deckId = params.get('deckId');
      if (deckId) {
        const deck = this.decks.find((d) => d.id === deckId);
        if (deck) {
          this.selectDeck(deck);
        } else {
          this.router.navigate(['/flashcards']);
        }
      } else {
        this.selectedDeck = null;
        this.viewMode = 'list-decks';
      }
    });
  }

  selectDeck(deck: Deck): void {
    this.selectedDeck = deck;
    this.viewMode = 'view-deck';
    this.flashcardService.getCardsByDeck(deck.id).subscribe((cards) => {
      this.cards = cards;
    });
  }

  // Deck Actions
  openDeckModal(): void {
    this.deckForm.reset({
      color: this.colors[0],
      icon: this.icons[0],
    });
    this.isDeckModalOpen = true;
  }

  saveDeck(): void {
    if (this.deckForm.invalid) return;
    this.flashcardService.createDeck(this.deckForm.value);
    this.isDeckModalOpen = false;
  }

  confirmDeleteDeck(deckId: string, event: Event): void {
    event.stopPropagation();
    this.itemToDeleteId = deckId;
    this.confirmType = 'deck';
    this.isConfirmDialogOpen = true;
  }

  // Card Actions
  openCardModal(): void {
    this.cardForm.reset();
    this.isCardModalOpen = true;
  }

  saveCard(): void {
    if (this.cardForm.invalid || !this.selectedDeck) return;
    this.flashcardService.createCard({
      deckId: this.selectedDeck.id,
      front: this.cardForm.value.front,
      back: this.cardForm.value.back,
    });
    this.isCardModalOpen = false;
  }

  confirmDeleteCard(cardId: string): void {
    this.itemToDeleteId = cardId;
    this.confirmType = 'card';
    this.isConfirmDialogOpen = true;
  }

  onConfirmDelete(): void {
    if (this.confirmType === 'deck') {
      this.flashcardService.deleteDeck(this.itemToDeleteId);
      if (this.selectedDeck?.id === this.itemToDeleteId) {
        this.router.navigate(['/flashcards']);
      }
    } else {
      this.flashcardService.deleteCard(this.itemToDeleteId);
    }
    this.isConfirmDialogOpen = false;
  }

  // Review (Leitner Box review)
  startReview(): void {
    if (!this.selectedDeck) return;
    this.reviewQueue = this.flashcardService.getCardsForReview(
      this.selectedDeck.id,
    );
    if (this.reviewQueue.length === 0) {
      // Fallback: review all if review date hasn't arrived
      this.reviewQueue = [...this.cards];
    }
    this.currentReviewIndex = 0;
    this.isFlipped = false;
    this.viewMode = 'review';
  }

  flipCard(): void {
    this.isFlipped = !this.isFlipped;
  }

  submitReview(correct: boolean): void {
    const currentCard = this.reviewQueue[this.currentReviewIndex];
    this.flashcardService.reviewCard(currentCard.id, correct);

    this.isFlipped = false;
    setTimeout(() => {
      this.currentReviewIndex++;
      if (this.currentReviewIndex >= this.reviewQueue.length) {
        // Finished review
        this.selectDeck(this.selectedDeck!);
      }
    }, 300);
  }
}
