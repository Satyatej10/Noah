import { inject } from '@angular/core';
import { CanDeactivateFn } from '@angular/router';
import { QuizService } from '../services/quiz.service';

export const quizActiveGuard: CanDeactivateFn<unknown> = () => {
  const quizService = inject(QuizService);

  if (quizService.isQuizActive()) {
    if (typeof window !== 'undefined') {
      return window.confirm(
        'You have a quiz in progress. Are you sure you want to leave? Your progress will be lost.',
      );
    }
  }

  return true;
};
