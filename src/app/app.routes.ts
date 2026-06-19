import { Routes } from '@angular/router';
import { quizActiveGuard } from './core/guards/quiz-active.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./features/dashboard/dashboard.component').then(
        (m) => m.DashboardComponent,
      ),
  },
  {
    path: 'flashcards',
    loadComponent: () =>
      import('./features/flashcards/flashcards.component').then(
        (m) => m.FlashcardsComponent,
      ),
  },
  {
    path: 'flashcards/:deckId',
    loadComponent: () =>
      import('./features/flashcards/flashcards.component').then(
        (m) => m.FlashcardsComponent,
      ),
  },
  {
    path: 'quiz',
    loadComponent: () =>
      import('./features/quiz/quiz.component').then((m) => m.QuizComponent),
    canDeactivate: [quizActiveGuard],
  },
  {
    path: 'timer',
    loadComponent: () =>
      import('./features/timer/timer.component').then((m) => m.TimerComponent),
  },
  {
    path: 'resources',
    loadComponent: () =>
      import('./features/resources/resources.component').then(
        (m) => m.ResourcesComponent,
      ),
  },
  {
    path: 'progress',
    loadComponent: () =>
      import('./features/progress/progress.component').then(
        (m) => m.ProgressComponent,
      ),
  },
  {
    path: 'settings',
    loadComponent: () =>
      import('./features/settings/settings.component').then(
        (m) => m.SettingsComponent,
      ),
  },
  {
    path: '**',
    redirectTo: '',
  },
];
