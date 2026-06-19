import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import {
  TimerService,
  TimerState,
  TimerSettings,
} from '../../core/services/timer.service';
import { TimeFormatPipe } from '../../shared/pipes/time-format.pipe';

@Component({
  selector: 'app-timer',
  standalone: true,
  imports: [CommonModule, FormsModule, TimeFormatPipe],
  templateUrl: './timer.component.html',
  styleUrls: ['./timer.component.css'],
})
export class TimerComponent implements OnInit, OnDestroy {
  protected timerService = inject(TimerService);

  state!: TimerState;
  settings!: TimerSettings;

  private subs = new Subscription();

  ngOnInit(): void {
    this.subs.add(
      this.timerService.state$.subscribe((state) => {
        this.state = state;
      }),
    );

    this.subs.add(
      this.timerService.settings$.subscribe((settings) => {
        this.settings = settings;
      }),
    );
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }

  getModeLabel(): string {
    switch (this.state.mode) {
      case 'work':
        return 'Focus Session';
      case 'break':
        return 'Short Break';
      case 'longBreak':
        return 'Long Break';
    }
  }

  getProgressPercentage(): number {
    const totalSeconds =
      this.state.mode === 'work'
        ? this.settings.workMinutes * 60
        : this.state.mode === 'break'
          ? this.settings.breakMinutes * 60
          : this.settings.longBreakMinutes * 60;

    if (totalSeconds <= 0) return 0;
    const completedSeconds = totalSeconds - this.state.totalSeconds;
    return (completedSeconds / totalSeconds) * 100;
  }

  toggleStart(): void {
    if (this.state.isRunning) {
      this.timerService.pause();
    } else {
      this.timerService.start();
    }
  }

  updateQuickSetting(key: keyof TimerSettings, value: number): void {
    this.timerService.updateSettings({ [key]: value });
  }
}
