import { inject } from '@angular/core';
import { CanActivateFn, Router, UrlTree } from '@angular/router';
import { SupabaseService } from '../services/supabase.service';
import { map, filter, take, timeout, catchError } from 'rxjs/operators';
import { toObservable } from '@angular/core/rxjs-interop';
import { Observable, of } from 'rxjs';

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
    }),
    timeout(8000), // Add a timeout to prevent the guard from hanging
    catchError(() => {
      console.error("Auth guard timed out waiting for Supabase session. Redirecting to login.");
      // If timeout occurs, assume not logged in and redirect to login
      return of(router.createUrlTree(['/login']));
    })
  );
};
