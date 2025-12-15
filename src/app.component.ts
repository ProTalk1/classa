
import { Component, ChangeDetectionStrategy, inject, effect } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ThemeService } from './services/theme.service';
import { SupabaseService } from './services/supabase.service';

@Component({
  selector: 'app-root',
  template: `
    @if (supabase.authReady()) {
      <router-outlet />
    } @else {
      <div class="fixed inset-0 flex items-center justify-center">
        <div class="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
      </div>
    }
  `,
  imports: [RouterOutlet],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent {
  themeService = inject(ThemeService);
  supabase = inject(SupabaseService);

  constructor() {
    effect(() => {
      const theme = this.themeService.theme();
      if (theme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    });
  }
}
