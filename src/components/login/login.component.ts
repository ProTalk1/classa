
import { Component, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { SupabaseService } from '../../services/supabase.service';
import { ThemeService } from '../../services/theme.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, RouterLink, CommonModule],
  templateUrl: './login.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginComponent {
  supabase = inject(SupabaseService);
  themeService = inject(ThemeService);
  // FIX: Explicitly type `router` to resolve type inference issue.
  router: Router = inject(Router);

  email = signal('');
  password = signal('');
  loading = signal(false);
  googleLoading = signal(false);
  appleLoading = signal(false);
  errorMessage = signal<string | null>(null);
  passwordVisible = signal(false);

  async handleLogin() {
    this.loading.set(true);
    this.errorMessage.set(null);
    try {
      const { error } = await this.supabase.signIn(this.email(), this.password());
      if (error) {
        this.errorMessage.set(error.message);
      } else {
        this.router.navigate(['/']);
      }
    } catch (error) {
      if (error instanceof Error) {
        this.errorMessage.set(error.message);
      } else {
        this.errorMessage.set('An unexpected error occurred.');
      }
    } finally {
      this.loading.set(false);
    }
  }

  async handleGoogleLogin() {
    this.googleLoading.set(true);
    this.errorMessage.set(null);
    try {
      const { error } = await this.supabase.signInWithGoogle();
      if (error) {
        this.errorMessage.set(error.message);
      }
      // Supabase handles the redirect, so no navigation is needed here.
    } catch (error) {
      if (error instanceof Error) {
        this.errorMessage.set(error.message);
      } else {
        this.errorMessage.set('An unexpected error occurred with Google Sign-In.');
      }
    } finally {
      this.googleLoading.set(false);
    }
  }

  async handleAppleLogin() {
    this.appleLoading.set(true);
    this.errorMessage.set(null);
    try {
      const { error } = await this.supabase.signInWithApple();
      if (error) {
        this.errorMessage.set(error.message);
      }
      // Supabase handles the redirect.
    } catch (error) {
      if (error instanceof Error) {
        this.errorMessage.set(error.message);
      } else {
        this.errorMessage.set('An unexpected error occurred with Apple Sign-In.');
      }
    } finally {
      this.appleLoading.set(false);
    }
  }


  togglePasswordVisibility() {
    this.passwordVisible.update(v => !v);
  }

  toggleTheme() {
      this.themeService.toggleTheme();
  }
}
