
import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';

export const APP_ROUTES: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./components/login/login.component').then(c => c.LoginComponent)
  },
  {
    path: '',
    loadComponent: () => import('./components/layout/layout.component').then(c => c.LayoutComponent),
    canActivate: [authGuard],
    children: [
        { path: '', redirectTo: 'feed', pathMatch: 'full' },
        { path: 'feed', loadComponent: () => import('./components/feed/feed.component').then(c => c.FeedComponent) },
        { path: 'groups', loadComponent: () => import('./components/groups/groups.component').then(c => c.GroupsComponent) },
        { path: 'notifications', loadComponent: () => import('./components/notifications/notifications.component').then(c => c.NotificationsComponent) },
        { path: 'profile', loadComponent: () => import('./components/profile/profile.component').then(c => c.ProfileComponent) },
    ]
  },
  {
    path: '**',
    redirectTo: '',
    pathMatch: 'full'
  }
];
