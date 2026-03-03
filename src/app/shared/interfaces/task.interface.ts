/**
 * Task Status Enum
 */
export enum TaskStatus {
  TODO = 'todo',
  IN_PROGRESS = 'in-progress',
  DONE = 'done'
}

/**
 * Task Priority Enum
 */
export enum TaskPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high'
}

/**
 * Task Interface
 */
export interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: Date | null;
  createdDate: Date;
  tags: string[];
}

/**
 * Task Filter Interface
 */
export interface TaskFilter {
  status?: TaskStatus;
  priority?: TaskPriority;
  tags?: string[];
  showOverdueOnly?: boolean;
  searchQuery?: string;
}

/**
 * Sorting Options for Tasks
 */
export type SortField = 'dueDate' | 'createdDate' | 'priority';
export type SortDirection = 'asc' | 'desc';

/**
 * Task Sorting Interface
 */
export interface TaskSort {
  field: SortField;
  direction: SortDirection;
}

/**
 * Dashboard Statistics Interface
 */
export interface DashboardStats {
  totalTasks: number;
  completedTasks: number;
  completionPercentage: number;
  overdueCount: number;
  tasksByStatus: Record<TaskStatus, number>;
  tasksByPriority: Record<TaskPriority, number>;
}
