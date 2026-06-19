import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ThemeService } from '../../core/services/theme.service';
import { StorageService } from '../../core/services/storage.service';
import { TimerService, TimerSettings } from '../../core/services/timer.service';
import { ConfirmDialogComponent } from '../../shared/components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, FormsModule, ConfirmDialogComponent],
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css'],
})
export class SettingsComponent implements OnInit {
  protected themeService = inject(ThemeService);
  private storageService = inject(StorageService);
  private timerService = inject(TimerService);

  timerSettings!: TimerSettings;
  isConfirmDialogOpen = false;

  // Feedback notifications
  notification: { type: 'success' | 'error'; message: string } | null = null;

  ngOnInit(): void {
    this.timerService.settings$.subscribe((settings) => {
      this.timerSettings = { ...settings };
    });
  }

  showNotification(type: 'success' | 'error', message: string): void {
    this.notification = { type, message };
    setTimeout(() => {
      this.notification = null;
    }, 4000);
  }

  saveTimerSettings(): void {
    this.timerService.updateSettings(this.timerSettings);
    this.showNotification('success', 'Timer configuration saved successfully!');
  }

  exportData(): void {
    try {
      const dataStr = this.storageService.exportAll();
      const dataUri =
        'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);

      const exportFileDefaultName = `noah_backup_${new Date().toISOString().split('T')[0]}.json`;

      if (typeof window !== 'undefined') {
        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', exportFileDefaultName);
        linkElement.click();
        this.showNotification('success', 'Backup file exported successfully!');
      }
    } catch {
      this.showNotification('error', 'Failed to export backup data.');
    }
  }

  importData(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;

    const file = input.files[0];
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      const success = this.storageService.importAll(result);
      if (success) {
        this.showNotification(
          'success',
          'Data imported successfully! Reloading...',
        );
        setTimeout(() => {
          if (typeof window !== 'undefined') {
            window.location.reload();
          }
        }, 1500);
      } else {
        this.showNotification(
          'error',
          'Failed to parse backup file. Please make sure the JSON format is valid.',
        );
      }
    };
    reader.readAsText(file);
  }

  confirmReset(): void {
    this.isConfirmDialogOpen = true;
  }

  resetAllData(): void {
    this.storageService.clear();
    this.showNotification(
      'success',
      'Database cleared successfully! Resetting workspace...',
    );
    this.isConfirmDialogOpen = false;
    setTimeout(() => {
      if (typeof window !== 'undefined') {
        window.location.reload();
      }
    }, 1500);
  }
}
