import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-stat-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="stat-card" [style.--accent]="accentColor">
      <div class="stat-icon">{{ icon }}</div>
      <div class="stat-content">
        <span class="stat-value">{{ value }}</span>
        <span class="stat-label">{{ label }}</span>
      </div>
      @if (trend) {
        <span
          class="stat-trend"
          [class.positive]="trend === 'up'"
          [class.negative]="trend === 'down'"
        >
          {{ trend === 'up' ? '↑' : trend === 'down' ? '↓' : '→' }}
        </span>
      }
    </div>
  `,
  styles: [
    `
      .stat-card {
        background: var(--surface-card);
        border: 1px solid var(--border-color);
        border-radius: 16px;
        padding: 1.25rem;
        display: flex;
        align-items: center;
        gap: 1rem;
        transition: all 0.3s ease;
        position: relative;
        overflow: hidden;
      }

      .stat-card::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        height: 3px;
        background: var(--accent, var(--primary));
        border-radius: 16px 16px 0 0;
      }

      .stat-card:hover {
        transform: translateY(-2px);
        box-shadow: var(--shadow-md);
        border-color: var(--accent, var(--primary));
      }

      .stat-icon {
        font-size: 2rem;
        width: 48px;
        height: 48px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: var(--surface-hover);
        border-radius: 12px;
        flex-shrink: 0;
      }

      .stat-content {
        display: flex;
        flex-direction: column;
        gap: 0.2rem;
        flex: 1;
      }

      .stat-value {
        font-size: 1.5rem;
        font-weight: 700;
        color: var(--text-primary);
        font-family: 'JetBrains Mono', monospace;
      }

      .stat-label {
        font-size: 0.8rem;
        color: var(--text-secondary);
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }

      .stat-trend {
        font-size: 1.25rem;
        font-weight: 700;
      }

      .stat-trend.positive {
        color: var(--success);
      }

      .stat-trend.negative {
        color: var(--error);
      }
    `,
  ],
})
export class StatCardComponent {
  @Input() icon = '📊';
  @Input() value: string | number = 0;
  @Input() label = '';
  @Input() accentColor = '';
  @Input() trend: 'up' | 'down' | 'neutral' | null = null;
}
