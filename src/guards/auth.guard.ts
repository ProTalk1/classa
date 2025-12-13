import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { SupabaseService } from '../services/supabase.service';
import { map } from 'rxjs/operators';
import { toObservable } from '@angular/core/rxjs-interop';

export const authGuard: CanActivateFn = () => {
  const supabase = inject(SupabaseService);
  // FIX: Explicitly type `router` to resolve type inference issue.
  const router: Router = inject(Router);

  // Supabase auth state is reactive via signals
  const session = supabase.session();
  if (session) {
      return true;
  } else {
      router.navigate(['/login']);
      return false;
  }
};