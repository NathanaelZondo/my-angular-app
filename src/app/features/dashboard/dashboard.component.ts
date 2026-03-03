import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterOutlet } from '@angular/router';
import { FirestoreService } from '../../core/services/firestore.service';
import { DashboardStats, TaskStatus, TaskPriority } from '../../shared/interfaces/task.interface';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent {
  stats: DashboardStats = {
    totalTasks: 0,
    completedTasks: 0,
    completionPercentage: 0,
    overdueCount: 0,
    tasksByStatus: { 'todo': 0, 'in-progress': 0, 'done': 0 },
    tasksByPriority: { 'low': 0, 'medium': 0, 'high': 0 }
  };

  constructor(private firestoreService: FirestoreService) {}

  ngOnInit(): void {
    this.updateStats();
  }

  private async updateStats(): Promise<void> {
    const stats = await this.firestoreService.calculateDashboardStats();
    // @ts-ignore - temporarily suppress type errors during migration
    this.stats = stats;
  }

  getTaskStatusColor(status: TaskStatus | string): string {
    const colors: Record<TaskStatus, string> = {
      [TaskStatus.TODO]: '#ff9800',
      [TaskStatus.IN_PROGRESS]: '#2196f3',
      [TaskStatus.DONE]: '#4caf50'
    };
    return colors[status as TaskStatus] || '#9e9e9e';
  }

  getPriorityColor(priority: TaskPriority | string): string {
    const colors: Record<TaskPriority, string> = {
      [TaskPriority.LOW]: '#8bc34a',
      [TaskPriority.MEDIUM]: '#ff9800',
      [TaskPriority.HIGH]: '#f44336'
    };
    return colors[priority as TaskPriority] || '#9e9e9e';
  }

  calculateBarPercentage(count: number): number {
    if (this.stats.totalTasks === 0) return 0;
    return Math.round((count / this.stats.totalTasks) * 100);
  }

  getTaskStatusCount(status: TaskStatus | string): number {
    const count = this.stats.tasksByStatus[status as TaskStatus];
    return typeof count === 'number' ? count : 0;
  }

  getPriorityCount(priority: TaskPriority | string): number {
    const count = this.stats.tasksByPriority[priority as TaskPriority];
    return typeof count === 'number' ? count : 0;
  }
}
