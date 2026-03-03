import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { 
    path: 'login', 
    loadComponent: () => import('./features/auth/login/login.component').then(({ LoginComponent }) => LoginComponent) 
  },
  { 
    path: 'register', 
    loadComponent: () => import('./features/auth/register/register.component').then(({ RegisterComponent }) => RegisterComponent) 
  },
  { 
    path: 'dashboard', 
    canActivate: [authGuard],
    loadComponent: () => import('./features/dashboard/dashboard.component').then(({ DashboardComponent }) => DashboardComponent) 
  },
  { 
    path: 'tasks', 
    canActivate: [authGuard],
    loadComponent: () => import('./features/task-list/task-list.component').then(({ TaskListComponent }) => TaskListComponent) 
  },
  { 
    path: 'tasks/new', 
    canActivate: [authGuard],
    loadComponent: () => import('./features/task-detail/task-detail.component').then(({ TaskDetailComponent }) => TaskDetailComponent) 
  },
  { 
    path: 'tasks/:id', 
    canActivate: [authGuard],
    loadComponent: () => import('./features/task-detail/task-detail.component').then(({ TaskDetailComponent }) => TaskDetailComponent) 
  },
  { path: '**', redirectTo: 'login' }
];
