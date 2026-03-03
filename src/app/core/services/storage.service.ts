import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { Task, TaskFilter, TaskSort, DashboardStats, TaskStatus, TaskPriority } from '../../shared/interfaces/task.interface';

@Injectable({
  providedIn: 'root'
})
export class StorageService {
  private readonly STORAGE_KEY = 'smart_task_manager_tasks';
  
  // Private BehaviorSubject for internal state management
  private tasksSubject = new BehaviorSubject<Task[]>([]);
  public tasks$ = this.tasksSubject.asObservable();

  // Initialize on startup - load from localStorage or start with empty array
  constructor() {
    const storedTasks = localStorage.getItem(this.STORAGE_KEY);
    if (storedTasks) {
      try {
        const parsedTasks: Task[] = JSON.parse(storedTasks).map((task: any) => ({
          ...task,
          dueDate: task.dueDate ? new Date(task.dueDate) : null,
          createdDate: new Date(task.createdDate)
        }));
        this.tasksSubject.next(parsedTasks);
      } catch (error) {
        console.error('Error parsing stored tasks:', error);
        this.tasksSubject.next([]);
      }
    } else {
      this.tasksSubject.next([]);
    }
  }

  /**
   * Save tasks to localStorage
   */
  private saveToStorage(): void {
    const currentTasks = this.tasksSubject.getValue();
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(currentTasks));
  }

  /**
   * Get all tasks as Observable
   */
  getTasks(): Observable<Task[]> {
    return this.tasks$;
  }

  /**
   * Add a new task
   */
  addTask(task: Omit<Task, 'id' | 'createdDate'>): Task {
    const currentTasks = this.tasksSubject.getValue();
    const newTask: Task = {
      ...task,
      id: this.generateId(),
      createdDate: new Date()
    };
    
    this.tasksSubject.next([...currentTasks, newTask]);
    this.saveToStorage();
    
    return newTask;
  }

  /**
   * Update an existing task
   */
  updateTask(updatedTask: Task): Task {
    const currentTasks = this.tasksSubject.getValue();
    const index = currentTasks.findIndex(t => t.id === updatedTask.id);
    
    if (index === -1) {
      return updatedTask; // Task not found, return as-is
    }

    const newTasks = [...currentTasks];
    newTasks[index] = updatedTask;
    
    this.tasksSubject.next(newTasks);
    this.saveToStorage();
    
    return updatedTask;
  }

  /**
   * Delete a task by ID
   */
  deleteTask(taskId: string): void {
    const currentTasks = this.tasksSubject.getValue();
    const newTasks = currentTasks.filter(t => t.id !== taskId);
    
    this.tasksSubject.next(newTasks);
    this.saveToStorage();
  }

  /**
   * Get tasks filtered and sorted
   */
  getFilteredAndSortedTasks(filter?: TaskFilter, sort?: TaskSort): Task[] {
    let tasks = [...this.tasksSubject.getValue()];

    // Apply filters
    if (filter) {
      if (filter.status) {
        tasks = tasks.filter(t => t.status === filter.status);
      }

      if (filter.priority) {
        tasks = tasks.filter(t => t.priority === filter.priority);
      }

      if (filter.tags && filter.tags.length > 0) {
        tasks = tasks.filter(t => 
          filter!.tags!.some(tag => t.tags.includes(tag))
        );
      }

      if (filter.searchQuery) {
        const query = filter.searchQuery.toLowerCase();
        tasks = tasks.filter(t => 
          t.title.toLowerCase().includes(query) ||
          t.description.toLowerCase().includes(query) ||
          t.tags.some(tag => tag.toLowerCase().includes(query))
        );
      }

      if (filter.showOverdueOnly) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        tasks = tasks.filter(t => 
          t.dueDate !== null && 
          new Date(t.dueDate) < today && 
          t.status !== TaskStatus.DONE
        );
      }
    }

    // Apply sorting
    if (sort) {
      tasks.sort((a, b) => {
        let comparison = 0;

        switch (sort.field) {
          case 'dueDate':
            const dueA = a.dueDate ? new Date(a.dueDate).getTime() : Infinity;
            const dueB = b.dueDate ? new Date(b.dueDate).getTime() : Infinity;
            comparison = dueA - dueB;
            break;

          case 'createdDate':
            comparison = new Date(a.createdDate).getTime() - new Date(b.createdDate).getTime();
            break;

          case 'priority':
            const priorityOrder: Record<TaskPriority, number> = {
              [TaskPriority.HIGH]: 0,
              [TaskPriority.MEDIUM]: 1,
              [TaskPriority.LOW]: 2
            };
            comparison = priorityOrder[a.priority] - priorityOrder[b.priority];
            break;
        }

        return sort.direction === 'desc' ? -comparison : comparison;
      });
    }

    return tasks;
  }

  /**
   * Calculate dashboard statistics
   */
  getDashboardStats(): DashboardStats {
    const tasks = this.tasksSubject.getValue();
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const completedTasks = tasks.filter(t => t.status === TaskStatus.DONE).length;
    const overdueCount = tasks.filter(t => 
      t.dueDate !== null && 
      new Date(t.dueDate) < today && 
      t.status !== TaskStatus.DONE
    ).length;

    const totalTasks = tasks.length;
    const completionPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    const tasksByStatus: Record<TaskStatus, number> = {
      [TaskStatus.TODO]: tasks.filter(t => t.status === TaskStatus.TODO).length,
      [TaskStatus.IN_PROGRESS]: tasks.filter(t => t.status === TaskStatus.IN_PROGRESS).length,
      [TaskStatus.DONE]: tasks.filter(t => t.status === TaskStatus.DONE).length
    };

    const tasksByPriority: Record<TaskPriority, number> = {
      [TaskPriority.LOW]: tasks.filter(t => t.priority === TaskPriority.LOW).length,
      [TaskPriority.MEDIUM]: tasks.filter(t => t.priority === TaskPriority.MEDIUM).length,
      [TaskPriority.HIGH]: tasks.filter(t => t.priority === TaskPriority.HIGH).length
    };

    return {
      totalTasks,
      completedTasks,
      completionPercentage,
      overdueCount,
      tasksByStatus,
      tasksByPriority
    };
  }

  /**
   * Clear all tasks (for testing/reset purposes)
   */
  clearAllTasks(): void {
    this.tasksSubject.next([]);
    localStorage.removeItem(this.STORAGE_KEY);
  }

  /**
   * Generate a unique ID for new tasks
   */
  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
  }
}
