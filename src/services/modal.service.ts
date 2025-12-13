import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ModalService {
  showCreatePostModal = signal(false);

  openCreatePostModal() {
    this.showCreatePostModal.set(true);
  }

  closeCreatePostModal() {
    this.showCreatePostModal.set(false);
  }
}
