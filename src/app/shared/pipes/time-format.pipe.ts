import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'timeFormat',
  standalone: true,
})
export class TimeFormatPipe implements PipeTransform {
  transform(
    totalSeconds: number,
    format: 'mm:ss' | 'hh:mm:ss' | 'human' = 'mm:ss',
  ): string {
    if (totalSeconds < 0) totalSeconds = 0;

    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    switch (format) {
      case 'mm:ss':
        return `${this.pad(minutes)}:${this.pad(seconds)}`;
      case 'hh:mm:ss':
        return `${this.pad(hours)}:${this.pad(minutes)}:${this.pad(seconds)}`;
      case 'human':
        if (hours > 0) return `${hours}h ${minutes}m`;
        if (minutes > 0) return `${minutes}m ${seconds}s`;
        return `${seconds}s`;
      default:
        return `${this.pad(minutes)}:${this.pad(seconds)}`;
    }
  }

  private pad(num: number): string {
    return num.toString().padStart(2, '0');
  }
}
