import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ThemeService } from '../../../core/services/theme.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css'],
})
export class SidebarComponent {
  themeService = inject(ThemeService);
  isMobileMenuOpen = false;

  navItems = [
    { path: '/', label: 'Dashboard', icon: '📊' },
    { path: '/flashcards', label: 'Flashcards', icon: '🃏' },
    { path: '/quiz', label: 'Quiz', icon: '❓' },
    { path: '/timer', label: 'Timer', icon: '⏱️' },
    { path: '/resources', label: 'Resources', icon: '📚' },
    { path: '/progress', label: 'Progress', icon: '📈' },
    { path: '/settings', label: 'Settings', icon: '⚙️' },
  ];

  toggleMobileMenu(): void {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
  }

  closeMobileMenu(): void {
    this.isMobileMenuOpen = false;
  }
}
