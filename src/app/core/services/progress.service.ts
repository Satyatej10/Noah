import { Injectable } from '@angular/core';
import { UserStats, DailyProgress } from '../models/progress.model';
import { FlashcardService } from './flashcard.service';
import { QuizService } from './quiz.service';
import { TimerService } from './timer.service';
import { StorageService } from './storage.service';

@Injectable({
  providedIn: 'root',
})
export class ProgressService {
  private readonly STREAK_KEY = 'noah_streak';
  private readonly LAST_ACTIVE_KEY = 'noah_last_active';

  constructor(
    private flashcardService: FlashcardService,
    private quizService: QuizService,
    private timerService: TimerService,
    private storage: StorageService,
  ) {
    this.updateStreak();
  }

  getUserStats(): UserStats {
    const studySessions = this.timerService.getStudySessions();
    const quizResults = this.quizService.getResults();
    const boxDistribution = this.flashcardService.getBoxDistribution();

    const totalStudyMinutes = studySessions.reduce(
      (sum, s) => sum + s.durationMinutes,
      0,
    );
    const totalCardsReviewed = studySessions.filter(
      (s) => s.type === 'flashcard',
    ).length;
    const averageQuizScore =
      quizResults.length > 0
        ? Math.round(
            quizResults.reduce((sum, r) => sum + r.percentage, 0) /
              quizResults.length,
          )
        : 0;

    const streakData = this.storage.get<{ current: number; longest: number }>(
      this.STREAK_KEY,
    ) || { current: 0, longest: 0 };

    return {
      totalStudyMinutes,
      totalCardsReviewed,
      totalQuizzesTaken: quizResults.length,
      currentStreak: streakData.current,
      longestStreak: streakData.longest,
      cardsInBox: boxDistribution,
      averageQuizScore,
    };
  }

  getDailyProgress(days: number = 30): DailyProgress[] {
    const studySessions = this.timerService.getStudySessions();
    const quizResults = this.quizService.getResults();
    const progress: DailyProgress[] = [];

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];

      const daySessions = studySessions.filter((s) => s.date === dateStr);
      const dayQuizzes = quizResults.filter((r) =>
        r.completedAt.startsWith(dateStr),
      );

      progress.push({
        date: dateStr,
        studyMinutes: daySessions.reduce(
          (sum, s) => sum + s.durationMinutes,
          0,
        ),
        cardsReviewed: daySessions.filter((s) => s.type === 'flashcard').length,
        quizzesTaken: dayQuizzes.length,
        averageScore:
          dayQuizzes.length > 0
            ? Math.round(
                dayQuizzes.reduce((sum, r) => sum + r.percentage, 0) /
                  dayQuizzes.length,
              )
            : 0,
      });
    }

    return progress;
  }

  getRecentActivity(
    limit: number = 10,
  ): Array<{ type: string; description: string; date: string }> {
    const studySessions = this.timerService.getStudySessions();
    const quizResults = this.quizService.getResults();

    const activities: Array<{
      type: string;
      description: string;
      date: string;
    }> = [];

    studySessions.forEach((s) => {
      activities.push({
        type: s.type,
        description: `Completed a ${s.durationMinutes} min ${s.type} session`,
        date: s.completedAt,
      });
    });

    quizResults.forEach((r) => {
      activities.push({
        type: 'quiz',
        description: `Scored ${r.percentage}% on ${r.deckName} quiz`,
        date: r.completedAt,
      });
    });

    return activities
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, limit);
  }

  private updateStreak(): void {
    const today = new Date().toISOString().split('T')[0];
    const lastActive = this.storage.get<string>(this.LAST_ACTIVE_KEY);
    const streakData = this.storage.get<{ current: number; longest: number }>(
      this.STREAK_KEY,
    ) || { current: 0, longest: 0 };

    if (lastActive === today) return;

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    if (lastActive === yesterdayStr) {
      streakData.current++;
    } else {
      streakData.current = 1;
    }

    streakData.longest = Math.max(streakData.current, streakData.longest);
    this.storage.set(this.STREAK_KEY, streakData);
    this.storage.set(this.LAST_ACTIVE_KEY, today);
  }
}
