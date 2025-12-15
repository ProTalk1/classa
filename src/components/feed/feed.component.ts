
import { Component, ChangeDetectionStrategy, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SupabaseService, Profile } from '../../services/supabase.service';
import { GeminiService } from '../../services/gemini.service';
import { ModalService } from '../../services/modal.service';

interface Post {
  id: number;
  content: string;
  media_url: string | null;
  media_type: 'image' | 'pdf' | null;
  created_at: string;
  profiles: Profile | null;
  stats: {
    likes: number;
    comments: number;
  };
  isLiked?: boolean;
}

@Component({
  selector: 'app-feed',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './feed.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FeedComponent implements OnInit {
  supabase = inject(SupabaseService);
  geminiService = inject(GeminiService);
  modalService = inject(ModalService);
  profile = this.supabase.profile;
  
  loading = signal(true);
  posts = signal<Post[]>([]);
  showCreatePostModal = this.modalService.showCreatePostModal;
  newPostContent = signal('');
  newPostTags = signal('');
  selectedFile = signal<{ name: string; type: 'image' | 'pdf'; url: string; fileType: string; } | null>(null);

  // Signals for post editing
  editingPostId = signal<number | null>(null);
  editingPostContent = signal('');
  isImprovingWithAI = signal(false);

  async ngOnInit() {
    await this.loadPosts();
  }

  async loadPosts() {
    this.loading.set(true);
    try {
      const supabasePosts = await this.supabase.getPosts();
      if (supabasePosts) {
        const postsWithStats = supabasePosts.map((post: any) => ({
          ...post,
          stats: {
            likes: post.likes || Math.floor(Math.random() * 50),
            comments: post.comments || Math.floor(Math.random() * 15),
          },
          isLiked: Math.random() > 0.5,
        }));
        this.posts.set(postsWithStats);
      }
    } catch (e) {
      console.error('Erro ao carregar postagens', e);
    } finally {
      this.loading.set(false);
    }
  }
  
  isAuthor(post: Post): boolean {
    return !!(this.supabase.user?.id && post.profiles?.id && this.supabase.user.id === post.profiles.id);
  }

  getInitials(name: string | undefined): string {
    if (!name) return '';
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  }
  
  formatTimeAgo(timestamp: string): string {
    if (!timestamp) return '';
    const now = new Date();
    const postDate = new Date(timestamp);
    const seconds = Math.floor((now.getTime() - postDate.getTime()) / 1000);
    
    let interval = seconds / 86400; // days
    if (interval > 1) {
      return `${Math.floor(interval)}d atrás`;
    }
    interval = seconds / 3600; // hours
    if (interval > 1) {
      return `${Math.floor(interval)}h atrás`;
    }
    interval = seconds / 60; // minutes
    if (interval > 1) {
      return `${Math.floor(interval)}m atrás`;
    }
    return 'Agora mesmo';
  }

  toggleLike(post: Post) {
    this.posts.update(posts =>
      posts.map(p => {
        if (p.id === post.id) {
          const isLiked = !p.isLiked;
          const likes = isLiked ? p.stats.likes + 1 : p.stats.likes - 1;
          return { ...p, isLiked, stats: { ...p.stats, likes } };
        }
        return p;
      })
    );
  }

  openCreatePostModal() {
    this.modalService.openCreatePostModal();
  }

  closeCreatePostModal() {
    this.modalService.closeCreatePostModal();
    this.newPostContent.set('');
    this.newPostTags.set('');
    this.selectedFile.set(null);
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      const reader = new FileReader();
      reader.onload = (e) => {
        const url = e.target?.result as string;
        const fileType = file.type.startsWith('image/') ? 'image' : 'pdf';
        if (fileType === 'pdf' && !file.type.includes('pdf')) return;
        
        this.selectedFile.set({
          name: file.name,
          type: fileType,
          url: url,
          fileType: file.type
        });
      };
      reader.readAsDataURL(file);
    }
  }

  removeSelectedFile() {
    this.selectedFile.set(null);
  }

  createPost() {
    if (this.newPostContent().trim() === '' && !this.selectedFile()) {
      return;
    }
    
    const userProfile = this.profile();
    if (!userProfile) return;

    const newPost: Post = {
      id: Date.now(),
      content: this.newPostContent(),
      created_at: new Date().toISOString(),
      profiles: userProfile,
      media_url: null,
      media_type: null,
      stats: {
        likes: 0,
        comments: 0,
      },
      isLiked: false,
    };
    
    const file = this.selectedFile();
    if (file) {
      newPost.media_type = file.type;
      newPost.media_url = file.url;
    }

    this.posts.update(currentPosts => [newPost, ...currentPosts]);
    this.closeCreatePostModal();
  }

  // Edit functionality
  startEditing(post: Post) {
    this.editingPostId.set(post.id);
    this.editingPostContent.set(post.content);
  }

  cancelEditing() {
    this.editingPostId.set(null);
    this.editingPostContent.set('');
  }

  savePost(postToSave: Post) {
    // Here you would also call a Supabase service to update the post in the DB
    this.posts.update(currentPosts => 
      currentPosts.map(p => 
        p.id === postToSave.id 
          ? { ...p, content: this.editingPostContent() } 
          : p
      )
    );
    this.cancelEditing();
  }

  async improveWithAI() {
    this.isImprovingWithAI.set(true);
    try {
      const improvedText = await this.geminiService.improveText(this.editingPostContent());
      this.editingPostContent.set(improvedText);
    } catch(error) {
      console.error("Falha ao melhorar o texto com IA", error);
      // Optionally show an error to the user
    } finally {
      this.isImprovingWithAI.set(false);
    }
  }
}
