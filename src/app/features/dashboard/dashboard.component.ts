import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ProgressService } from '../../core/services/progress.service';
import { FlashcardService } from '../../core/services/flashcard.service';
import { UserStats } from '../../core/models/progress.model';
import { Deck } from '../../core/models/flashcard.model';
import { StatCardComponent } from '../../shared/components/stat-card/stat-card.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, StatCardComponent],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
})
export class DashboardComponent implements OnInit {
  private progressService = inject(ProgressService);
  private flashcardService = inject(FlashcardService);

  stats!: UserStats;
  recentActivity: Array<{ type: string; description: string; date: string }> =
    [];
  decks: Deck[] = [];

  ngOnInit(): void {
    this.stats = this.progressService.getUserStats();
    this.recentActivity = this.progressService.getRecentActivity(5);
    this.flashcardService.getDecks().subscribe((decks) => {
      this.decks = decks.slice(0, 3); // show up to 3 decks
    });
  }

  getActivityIcon(type: string): string {
    switch (type) {
      case 'pomodoro':
        return '⏱️';
      case 'flashcard':
        return '🃏';
      case 'quiz':
        return '❓';
      default:
        return '📝';
    }
  }
}
