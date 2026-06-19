import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, interval, Subscription } from 'rxjs';
import { StorageService } from './storage.service';
import { StudySession } from '../models/progress.model';

export interface TimerState {
  minutes: number;
  seconds: number;
  totalSeconds: number;
  isRunning: boolean;
  isPaused: boolean;
  mode: 'work' | 'break' | 'longBreak';
  sessionsCompleted: number;
}

export interface TimerSettings {
  workMinutes: number;
  breakMinutes: number;
  longBreakMinutes: number;
  sessionsBeforeLongBreak: number;
  autoStartBreaks: boolean;
  autoStartWork: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class TimerService {
  private readonly SETTINGS_KEY = 'noah_timer_settings';
  private readonly SESSIONS_KEY = 'noah_study_sessions';

  private timerSubscription: Subscription | null = null;

  private defaultSettings: TimerSettings = {
    workMinutes: 25,
    breakMinutes: 5,
    longBreakMinutes: 15,
    sessionsBeforeLongBreak: 4,
    autoStartBreaks: false,
    autoStartWork: false,
  };

  private stateSubject!: BehaviorSubject<TimerState>;
  state$!: Observable<TimerState>;

  private settingsSubject = new BehaviorSubject<TimerSettings>(
    this.defaultSettings,
  );
  settings$ = this.settingsSubject.asObservable();

  constructor(private storage: StorageService) {
    const loadedSettings = this.loadSettings();
    this.settingsSubject.next(loadedSettings);
    this.stateSubject = new BehaviorSubject<TimerState>(
      this.getInitialState(loadedSettings),
    );
    this.state$ = this.stateSubject.asObservable();
  }

  start(): void {
    const state = this.stateSubject.getValue();
    if (state.isRunning) return;

    this.stateSubject.next({ ...state, isRunning: true, isPaused: false });

    this.timerSubscription = interval(1000).subscribe(() => {
      const current = this.stateSubject.getValue();
      if (current.totalSeconds > 0) {
        const newTotal = current.totalSeconds - 1;
        this.stateSubject.next({
          ...current,
          totalSeconds: newTotal,
          minutes: Math.floor(newTotal / 60),
          seconds: newTotal % 60,
        });
      } else {
        this.onTimerComplete();
      }
    });
  }

  pause(): void {
    this.timerSubscription?.unsubscribe();
    const state = this.stateSubject.getValue();
    this.stateSubject.next({ ...state, isRunning: false, isPaused: true });
  }

  reset(): void {
    this.timerSubscription?.unsubscribe();
    this.stateSubject.next(
      this.getInitialState(this.settingsSubject.getValue()),
    );
  }

  skip(): void {
    this.onTimerComplete();
  }

  updateSettings(settings: Partial<TimerSettings>): void {
    const updated = { ...this.settingsSubject.getValue(), ...settings };
    this.storage.set(this.SETTINGS_KEY, updated);
    this.settingsSubject.next(updated);
    if (!this.stateSubject.getValue().isRunning) {
      this.stateSubject.next(this.getInitialState(updated));
    }
  }

  getStudySessions(): StudySession[] {
    return this.storage.get<StudySession[]>(this.SESSIONS_KEY) || [];
  }

  private onTimerComplete(): void {
    this.timerSubscription?.unsubscribe();
    const state = this.stateSubject.getValue();
    const settings = this.settingsSubject.getValue();

    // Play notification sound
    this.playNotification();

    if (state.mode === 'work') {
      // Save completed work session
      this.saveStudySession(settings.workMinutes);

      const newSessionsCompleted = state.sessionsCompleted + 1;
      const isLongBreak =
        newSessionsCompleted % settings.sessionsBeforeLongBreak === 0;
      const breakMinutes = isLongBreak
        ? settings.longBreakMinutes
        : settings.breakMinutes;

      const newState: TimerState = {
        minutes: breakMinutes,
        seconds: 0,
        totalSeconds: breakMinutes * 60,
        isRunning: false,
        isPaused: false,
        mode: isLongBreak ? 'longBreak' : 'break',
        sessionsCompleted: newSessionsCompleted,
      };

      this.stateSubject.next(newState);

      if (settings.autoStartBreaks) {
        setTimeout(() => this.start(), 500);
      }
    } else {
      const newState: TimerState = {
        minutes: settings.workMinutes,
        seconds: 0,
        totalSeconds: settings.workMinutes * 60,
        isRunning: false,
        isPaused: false,
        mode: 'work',
        sessionsCompleted: state.sessionsCompleted,
      };

      this.stateSubject.next(newState);

      if (settings.autoStartWork) {
        setTimeout(() => this.start(), 500);
      }
    }
  }

  private getInitialState(settings: TimerSettings): TimerState {
    return {
      minutes: settings.workMinutes,
      seconds: 0,
      totalSeconds: settings.workMinutes * 60,
      isRunning: false,
      isPaused: false,
      mode: 'work',
      sessionsCompleted: 0,
    };
  }

  private loadSettings(): TimerSettings {
    return (
      this.storage.get<TimerSettings>(this.SETTINGS_KEY) || this.defaultSettings
    );
  }

  private saveStudySession(durationMinutes: number): void {
    const session: StudySession = {
      id: Date.now().toString(36) + Math.random().toString(36).substr(2, 9),
      type: 'pomodoro',
      durationMinutes,
      date: new Date().toISOString().split('T')[0],
      completedAt: new Date().toISOString(),
    };
    const sessions = this.getStudySessions();
    sessions.push(session);
    this.storage.set(this.SESSIONS_KEY, sessions);
  }

  private playNotification(): void {
    if (typeof window === 'undefined') return;
    try {
      const audioCtx = new (
        window.AudioContext || (window as any).webkitAudioContext
      )();
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      oscillator.frequency.value = 800;
      oscillator.type = 'sine';
      gainNode.gain.value = 0.3;
      oscillator.start();
      gainNode.gain.exponentialRampToValueAtTime(
        0.01,
        audioCtx.currentTime + 0.5,
      );
      oscillator.stop(audioCtx.currentTime + 0.5);
    } catch {
      // Audio not available
    }
  }
}
