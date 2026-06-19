import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProgressService } from '../../core/services/progress.service';
import { UserStats, DailyProgress } from '../../core/models/progress.model';

interface SvgPoint {
  x: number;
  y: number;
}

@Component({
  selector: 'app-progress',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './progress.component.html',
  styleUrls: ['./progress.component.css'],
})
export class ProgressComponent implements OnInit {
  private progressService = inject(ProgressService);

  stats!: UserStats;
  dailyData: DailyProgress[] = [];
  daysRange = 7; // Show 7 days of charts

  protected readonly Math = Math;

  // SVG Chart Computations
  studyMinutesMax = 0;
  studyMinutesPoints = '';
  studyMinutesBars: Array<{
    x: number;
    y: number;
    height: number;
    value: number;
    dateLabel: string;
  }> = [];

  quizScorePoints = '';
  quizScoreDots: Array<{
    x: number;
    y: number;
    value: number;
    dateLabel: string;
  }> = [];

  ngOnInit(): void {
    this.stats = this.progressService.getUserStats();
    this.loadProgressData();
  }

  loadProgressData(): void {
    this.dailyData = this.progressService.getDailyProgress(this.daysRange);
    this.computeStudyChart();
    this.computeQuizChart();
  }

  changeRange(days: number): void {
    this.daysRange = days;
    this.loadProgressData();
  }

  computeStudyChart(): void {
    const width = 500;
    const height = 200;
    const paddingLeft = 40;
    const paddingRight = 20;
    const paddingTop = 20;
    const paddingBottom = 30;

    const chartWidth = width - paddingLeft - paddingRight;
    const chartHeight = height - paddingTop - paddingBottom;

    // Find max study minutes
    const maxVal = Math.max(...this.dailyData.map((d) => d.studyMinutes), 10); // min ceiling of 10
    this.studyMinutesMax = maxVal;

    const dataLength = this.dailyData.length;
    const stepX = chartWidth / (dataLength - 1 || 1);

    this.studyMinutesBars = this.dailyData.map((d, index) => {
      const x = paddingLeft + index * stepX;
      // Calculate normalized height
      const barHeight = (d.studyMinutes / maxVal) * chartHeight;
      const y = height - paddingBottom - barHeight;

      const dateObj = new Date(d.date);
      const dateLabel = dateObj.toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
      });

      return {
        x: x - 10, // Offset bar to center it
        y,
        height: barHeight,
        value: d.studyMinutes,
        dateLabel,
      };
    });
  }

  computeQuizChart(): void {
    const width = 500;
    const height = 200;
    const paddingLeft = 40;
    const paddingRight = 20;
    const paddingTop = 20;
    const paddingBottom = 30;

    const chartWidth = width - paddingLeft - paddingRight;
    const chartHeight = height - paddingTop - paddingBottom;

    const dataLength = this.dailyData.length;
    const stepX = chartWidth / (dataLength - 1 || 1);

    const points: SvgPoint[] = this.dailyData.map((d, index) => {
      const x = paddingLeft + index * stepX;
      // Quiz score is 0-100 percentage
      const y = height - paddingBottom - (d.averageScore / 100) * chartHeight;
      return { x, y };
    });

    // Generate SVG path string
    if (points.length > 0) {
      this.quizScorePoints = points
        .map((p, i) => (i === 0 ? `M ${p.x} ${p.y}` : `L ${p.x} ${p.y}`))
        .join(' ');
    } else {
      this.quizScorePoints = '';
    }

    this.quizScoreDots = this.dailyData.map((d, index) => {
      const pt = points[index];
      const dateObj = new Date(d.date);
      const dateLabel = dateObj.toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
      });

      return {
        x: pt.x,
        y: pt.y,
        value: d.averageScore,
        dateLabel,
      };
    });
  }
}
