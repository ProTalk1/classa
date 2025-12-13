import { Component, ChangeDetectionStrategy, inject, signal, effect } from '@angular/core';
import { Router } from '@angular/router';
import { SupabaseService, Profile } from '../../services/supabase.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './profile.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProfileComponent {
  supabase = inject(SupabaseService);
  router: Router = inject(Router);

  loading = signal(false);
  readonly profile = this.supabase.profile;

  // Local signals for form editing
  fullName = signal<string>('');
  bio = signal<string>('');
  avatarUrl = signal<string | null>(null);
  
  constructor() {
    effect(() => {
        const prof = this.profile();
        if (prof) {
            this.fullName.set(prof.full_name ?? '');
            this.bio.set(prof.bio ?? '');
            this.avatarUrl.set(prof.avatar_url ?? null);
        }
    });
  }

  async uploadAvatar(event: Event) {
    const input = event.target as HTMLInputElement;
    try {
      this.loading.set(true);
      if (!input.files || input.files.length === 0) {
        throw new Error('You must select an image to upload.');
      }

      const file = input.files[0];
      const fileExt = file.name.split('.').pop();
      const fileName = `${this.supabase.user?.id}.${fileExt}`;
      const filePath = `${fileName}`;
      
      const newAvatarUrl = await this.supabase.uploadAvatar(filePath, file);

      if (newAvatarUrl) {
          this.avatarUrl.set(newAvatarUrl);
      }

    } catch (error) {
      if (error instanceof Error) alert(error.message);
    } finally {
      this.loading.set(false);
    }
  }

  async updateProfile() {
    try {
      this.loading.set(true);
      const user = this.supabase.user;
      if (!user) throw new Error('No user logged in');

      const updates: Partial<Profile> = {
        id: user.id,
        full_name: this.fullName(),
        bio: this.bio(),
        avatar_url: this.avatarUrl() ?? undefined,
      };

      await this.supabase.updateProfile(updates);
      alert('Profile updated successfully!');

    } catch (error) {
      if (error instanceof Error) alert(error.message);
    } finally {
      this.loading.set(false);
    }
  }

  async handleLogout() {
    await this.supabase.signOut();
    this.router.navigate(['/login']);
  }
}
