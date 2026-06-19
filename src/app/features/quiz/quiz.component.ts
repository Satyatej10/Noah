import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { QuizService } from '../../core/services/quiz.service';
import { FlashcardService } from '../../core/services/flashcard.service';
import { Deck } from '../../core/models/flashcard.model';
import { QuizSession } from '../../core/models/quiz.model';

@Component({
  selector: 'app-quiz',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './quiz.component.html',
  styleUrls: ['./quiz.component.css'],
})
export class QuizComponent implements OnInit {
  private quizService = inject(QuizService);
  private flashcardService = inject(FlashcardService);
  private route = inject(ActivatedRoute);

  decks: Deck[] = [];
  selectedDeckId = '';
  questionCount = 10;
  session: QuizSession | null = null;
  selectedAnswer = '';
  typedAnswer = '';
  isAnswerSubmitted = false;
  isCorrect = false;

  // View state
  viewMode: 'setup' | 'active' | 'result' = 'setup';

  protected readonly Math = Math;

  ngOnInit(): void {
    this.flashcardService.getDecks().subscribe((decks) => {
      this.decks = decks;
      this.route.queryParams.subscribe((params) => {
        const deckId = params['deckId'];
        if (deckId && this.decks.some((d) => d.id === deckId)) {
          this.selectedDeckId = deckId;
        }
      });
    });

    this.quizService.session$.subscribe((session) => {
      this.session = session;
      if (session) {
        if (session.isActive) {
          this.viewMode = 'active';
        } else {
          this.viewMode = 'result';
        }
      } else {
        this.viewMode = 'setup';
      }
    });
  }

  startQuiz(): void {
    if (!this.selectedDeckId) return;
    this.quizService.generateQuiz(this.selectedDeckId, this.questionCount);
    this.selectedAnswer = '';
    this.typedAnswer = '';
    this.isAnswerSubmitted = false;
  }

  submitAnswer(): void {
    if (!this.session) return;
    const currentQuestion = this.session.questions[this.session.currentIndex];
    const answer =
      currentQuestion.type === 'multiple-choice'
        ? this.selectedAnswer
        : this.typedAnswer;

    if (!answer.trim()) return;

    this.isCorrect = this.quizService.answerQuestion(answer);
    this.isAnswerSubmitted = true;
  }

  nextQuestion(): void {
    this.selectedAnswer = '';
    this.typedAnswer = '';
    this.isAnswerSubmitted = false;
  }

  restartSetup(): void {
    this.quizService.endQuiz();
    this.viewMode = 'setup';
  }
}
