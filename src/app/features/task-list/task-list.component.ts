import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { FirestoreService } from '../../core/services/firestore.service';
import { Task, TaskFilter, TaskSort, TaskStatus, TaskPriority } from '../../shared/interfaces/task.interface';

@Component({
  selector: 'app-task-list',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './task-list.component.html',
  styleUrl: './task-list.component.scss'
})
export class TaskListComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  tasks: Task[] = [];
  filteredTasks: Task[] = [];
  
  // Filtering
  selectedStatus: TaskStatus | null = null;
  selectedPriority: TaskPriority | null = null;
  showOverdueOnly: boolean = false;
  searchQuery: string = '';

  // Sorting
  sortField: 'dueDate' | 'createdDate' | 'priority' = 'dueDate';
  sortDirection: 'asc' | 'desc' = 'asc';

  // Available options for filters
  statuses: { value: TaskStatus; label: string }[] = [
    { value: TaskStatus.TODO, label: 'To Do' },
    { value: TaskStatus.IN_PROGRESS, label: 'In Progress' },
    { value: TaskStatus.DONE, label: 'Done' }
  ];

  priorities: { value: TaskPriority; label: string }[] = [
    { value: TaskPriority.LOW, label: 'Low' },
    { value: TaskPriority.MEDIUM, label: 'Medium' },
    { value: TaskPriority.HIGH, label: 'High' }
  ];

  constructor(private firestoreService: FirestoreService) {}

  ngOnInit(): void {
    this.firestoreService.getTasks()
      .pipe(takeUntil(this.destroy$))
      .subscribe(tasks => {
        this.tasks = tasks;
        this.applyFiltersAndSort();
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  applyFiltersAndSort(): void {
    const filter: TaskFilter = {
      status: this.selectedStatus || undefined,
      priority: this.selectedPriority || undefined,
      showOverdueOnly: this.showOverdueOnly,
      searchQuery: this.searchQuery.trim() || undefined
    };

    const sort: TaskSort = {
      field: this.sortField,
      direction: this.sortDirection
    };

    this.filteredTasks = this.storageService.getFilteredAndSortedTasks(filter, sort);
  }

  onFilterChange(): void {
    this.applyFiltersAndSort();
  }

  onSearchChange(): void {
    this.applyFiltersAndSort();
  }

  toggleOverdueOnly(): void {
    this.showOverdueOnly = !this.showOverdueOnly;
    this.applyFiltersAndSort();
  }

  clearFilters(): void {
    this.selectedStatus = null;
    this.selectedPriority = null;
    this.showOverdueOnly = false;
    this.searchQuery = '';
    this.applyFiltersAndSort();
  }

  toggleSort(field: 'dueDate' | 'createdDate' | 'priority'): void {
    if (this.sortField === field) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortField = field;
      this.sortDirection = 'asc';
    }
    this.applyFiltersAndSort();
  }

  getSortIcon(field: 'dueDate' | 'createdDate' | 'priority'): string {
    if (this.sortField !== field) return '';
    return this.sortDirection === 'asc' ? ' ▲' : ' ▼';
  }

  getStatusLabel(status: TaskStatus): string {
    switch (status) {
      case TaskStatus.TODO: return 'To Do';
      case TaskStatus.IN_PROGRESS: return 'In Progress';
      case TaskStatus.DONE: return 'Done';
    }
  }

  getPriorityLabel(priority: TaskPriority): string {
    switch (priority) {
      case TaskPriority.LOW: return 'Low';
      case TaskPriority.MEDIUM: return 'Medium';
      case TaskPriority.HIGH: return 'High';
    }
  }

  getStatusColor(status: TaskStatus): string {
    const colors: Record<TaskStatus, string> = {
      [TaskStatus.TODO]: '#ff9800',
      [TaskStatus.IN_PROGRESS]: '#2196f3',
      [TaskStatus.DONE]: '#4caf50'
    };
    return colors[status];
  }

  getPriorityColor(priority: TaskPriority): string {
    const colors: Record<TaskPriority, string> = {
      [TaskPriority.LOW]: '#8bc34a',
      [TaskPriority.MEDIUM]: '#ff9800',
      [TaskPriority.HIGH]: '#f44336'
    };
    return colors[priority];
  }

  formatDate(date: Date | null): string {
    if (!date) return 'No due date';
    const d = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (d.getTime() === today.getTime()) {
      return 'Today';
    }
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    if (d.getTime() === tomorrow.getTime()) {
      return 'Tomorrow';
    }

    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }

  isOverdue(task: Task): boolean {
    if (!task.dueDate || task.status === TaskStatus.DONE) return false;
    const dueDate = new Date(task.dueDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return dueDate < today;
  }

  hasTag(task: Task, tag: string): boolean {
    return task.tags.includes(tag);
  }

  getUniqueTags(): string[] {
    const allTags = new Set<string>();
    this.tasks.forEach(task => {
      task.tags.forEach(tag => allTags.add(tag));
    });
    return Array.from(allTags).slice(0, 10);
  }

  private storageService = null; // Placeholder for backward compatibility during migration
}
