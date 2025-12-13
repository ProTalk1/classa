import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { SupabaseService } from '../../services/supabase.service';
import { ModalService } from '../../services/modal.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, CommonModule],
  templateUrl: './layout.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LayoutComponent {
  router: Router = inject(Router);
  supabase = inject(SupabaseService);
  modalService = inject(ModalService);

  profile = this.supabase.profile;

  isRouteActive(url: string): boolean {
    return this.router.isActive(url, true);
  }

  getInitials(name: string | undefined): string {
    if (!name) return '';
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  }

  openCreatePostModal() {
    // This only works if the user is on the feed page where the modal component lives.
    // If not, navigate to the feed page first, then open the modal.
    if (!this.isRouteActive('/feed')) {
        this.router.navigate(['/feed']).then(() => {
            this.modalService.openCreatePostModal();
        });
    } else {
        this.modalService.openCreatePostModal();
    }
  }

  async handleLogout() {
    await this.supabase.signOut();
    this.router.navigate(['/login']);
  }
}
