import { Injectable, inject } from '@angular/core';
import {
  collection,
  collectionData,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  QueryConstraint,
  orderBy,
  Timestamp,
} from '@angular/fire/firestore';
import { Firestore } from '@angular/fire/firestore';
import { AuthService } from './auth.service';
import { Task, TaskFilter, TaskSort, TaskStatus, TaskPriority } from '../../shared/interfaces/task.interface';
import { Observable, of, switchMap } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class FirestoreService {
  private firestore = inject(Firestore);
  private authService = inject(AuthService);
  private collectionRef = collection(this.firestore, 'tasks');

  getTasks(): Observable<Task[]> {
    return this.authService.currentUser$.pipe(
      switchMap((user) => {
        if (!user) {
          return of([] as Task[]);
        }
        
        // Create a query filtered by user ID and sorted by created date
        const q: QueryConstraint[] = [
          where('userId', '==', user.uid),
          orderBy('createdDate', 'desc'),
        ];

        const taskQuery = query(this.collectionRef, ...q);
        
        return collectionData(taskQuery, { idField: 'id' }) as Observable<
          (Task & { id: string; userId: string })[]
        >;
      })
    );
  }

  async addTask(task: Omit<Task, 'id' | 'createdDate'>): Promise<Task> {
    const user = this.authService.currentUser;
    if (!user) {
      throw new Error('User not authenticated');
    }

    const taskData = {
      ...task,
      userId: user.uid,
      createdDate: Timestamp.now(),
    };

    const docRef = await addDoc(this.collectionRef, taskData);
    return {
      ...task,
      id: docRef.id,
      createdDate: new Date(),
    } as Task;
  }

  async updateTask(updatedTask: Task): Promise<Task> {
    const user = this.authService.currentUser;
    if (!user) {
      throw new Error('User not authenticated');
    }

    await updateDoc(doc(this.firestore, 'tasks', updatedTask.id), {
      ...updatedTask,
      userId: user.uid,
    });

    return updatedTask;
  }

  async deleteTask(taskId: string): Promise<void> {
    await deleteDoc(doc(this.firestore, 'tasks', taskId));
  }

  getFilteredAndSortedTasks(
    filter?: TaskFilter,
    sort?: TaskSort
  ): (Task & { id: string })[] {
    return [];
  }

  async calculateDashboardStats() {
    const user = this.authService.currentUser;
    if (!user) {
      return {
        totalTasks: 0,
        completedTasks: 0,
        completionPercentage: 0,
        overdueCount: 0,
        tasksByStatus: {
          [TaskStatus.TODO]: 0,
          [TaskStatus.IN_PROGRESS]: 0,
          [TaskStatus.DONE]: 0,
        },
        tasksByPriority: {
          [TaskPriority.LOW]: 0,
          [TaskPriority.MEDIUM]: 0,
          [TaskPriority.HIGH]: 0,
        },
      };
    }

    return {
      totalTasks: 0,
      completedTasks: 0,
      completionPercentage: 0,
      overdueCount: 0,
      tasksByStatus: {
        [TaskStatus.TODO]: 0,
        [TaskStatus.IN_PROGRESS]: 0,
        [TaskStatus.DONE]: 0,
      },
      tasksByPriority: {
        [TaskPriority.LOW]: 0,
        [TaskPriority.MEDIUM]: 0,
        [TaskPriority.HIGH]: 0,
      },
    };
  }

  async clearAllTasks(): Promise<void> {
    const user = this.authService.currentUser;
    if (!user) return;

    console.log('Clearing all tasks for user:', user.uid);
  }
}
