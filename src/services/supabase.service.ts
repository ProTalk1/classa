
import { Injectable, signal } from '@angular/core';
import { createClient, SupabaseClient, User, AuthChangeEvent, Session } from '@supabase/supabase-js';

export interface Profile {
  id?: string;
  username: string;
  avatar_url: string;
  full_name: string;
  bio?: string;
}

@Injectable({
  providedIn: 'root',
})
export class SupabaseService {
  private supabase: SupabaseClient;
  private supabaseUrl = 'https://pcootbllwwsdgnmhsuuh.supabase.co';
  private supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBjb290Ymxsd3dzZGdubWhzdXVoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU1ODYxMTksImV4cCI6MjA4MTE2MjExOX0.Vwwi3yvKj9kDmgT4Gpp1wR5ag9pF0kAAR4dntNvC-94';
  
  _session = signal<Session | null>(null);
  _profile = signal<Profile | null>(null);
  authReady = signal(false);

  constructor() {
    this.supabase = createClient(this.supabaseUrl, this.supabaseKey);

    this.supabase.auth.onAuthStateChange(async (event, session) => {
      this._session.set(session);
      if (session?.user) {
        await this.getProfile();
      } else {
        this._profile.set(null);
      }
      this.authReady.set(true);
    });
  }
  
  get session() {
    return this._session.asReadonly();
  }

  get profile() {
    return this._profile.asReadonly();
  }

  get user(): User | null {
    return this.session()?.user ?? null;
  }

  async getPosts() {
    const { data, error } = await this.supabase
      .from('posts')
      .select('*, profiles(id, full_name, avatar_url)')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Erro ao buscar postagens:', error);
      throw error;
    }
    return data;
  }

  async getProfile() {
    try {
      const user = this.user;
      if (!user) throw new Error('Nenhum usuário logado');

      const { data, error, status } = await this.supabase
        .from('profiles')
        .select(`username, full_name, avatar_url, bio`)
        .eq('id', user.id)
        .single();

      if (error && status !== 406) {
        throw error;
      }

      if (data) {
        this._profile.set(data as Profile);
      }
    } catch (error) {
      console.error('Erro ao buscar perfil:', error);
    }
  }

  async updateProfile(profile: Partial<Profile>) {
    try {
        const user = this.user;
        if (!user) throw new Error('Nenhum usuário logado');

        const updates = {
            id: user.id,
            ...profile,
            updated_at: new Date(),
        };

        const { error } = await this.supabase.from('profiles').upsert(updates);
        if (error) {
            throw error;
        }
        await this.getProfile();
    } catch (error) {
        console.error('Erro ao atualizar perfil:', error);
        if (error instanceof Error) {
            alert(error.message);
        }
    }
  }

  async uploadAvatar(filePath: string, file: File) {
    try {
        const { error } = await this.supabase.storage
            .from('avatars')
            .upload(filePath, file, { upsert: true });

        if (error) {
            throw error;
        }
        
        const { data } = this.supabase.storage
            .from('avatars')
            .getPublicUrl(filePath);
            
        return data.publicUrl;

    } catch (error) {
        console.error('Erro ao enviar avatar:', error);
        return null;
    }
  }

  async signIn(email: string, password_token: string) {
    return this.supabase.auth.signInWithPassword({
        email: email,
        password: password_token
    });
  }

  async signOut() {
    return this.supabase.auth.signOut();
  }

  async signInWithGoogle() {
    return this.supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}${window.location.pathname}`,
      },
    });
  }

  async signInWithApple() {
    return this.supabase.auth.signInWithOAuth({
      provider: 'apple',
      options: {
        redirectTo: `${window.location.origin}${window.location.pathname}`,
      },
    });
  }
  
}
