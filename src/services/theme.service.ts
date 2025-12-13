
import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  theme = signal<'light' | 'dark'>('dark');

  toggleTheme() {
    this.theme.update(current => (current === 'dark' ? 'light' : 'dark'));
  }
}
