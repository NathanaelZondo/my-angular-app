import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: 'dashboard', loadComponent: () => import('./features/dashboard/dashboard.component').then(({ DashboardComponent }) => DashboardComponent) },
  { path: 'tasks', loadComponent: () => import('./features/task-list/task-list.component').then(({ TaskListComponent }) => TaskListComponent) },
  { path: 'tasks/new', loadComponent: () => import('./features/task-detail/task-detail.component').then(({ TaskDetailComponent }) => TaskDetailComponent) },
  { path: 'tasks/:id', loadComponent: () => import('./features/task-detail/task-detail.component').then(({ TaskDetailComponent }) => TaskDetailComponent) },
  { path: '**', redirectTo: 'dashboard' }
];
