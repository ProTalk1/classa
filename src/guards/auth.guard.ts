import { inject } from '@angular/core';
import { CanActivateFn, Router, UrlTree } from '@angular/router';
import { SupabaseService } from '../services/supabase.service';
import { map, filter, take } from 'rxjs/operators';
import { toObservable } from '@angular/core/rxjs-interop';
import { Observable } from 'rxjs';

export const authGuard: CanActivateFn = (): Observable<boolean | UrlTree> => {
  const supabase = inject(SupabaseService);
  const router: Router = inject(Router);

  return toObservable(supabase.authReady).pipe(
    filter(ready => ready), // Wait until Supabase client has checked session
    take(1), // We only need to check once
    map(() => {
      const session = supabase.session();
      if (session) {
        return true;
      }
      // Redirect to login page if no session
      return router.createUrlTree(['/login']);
    })
  );
};
