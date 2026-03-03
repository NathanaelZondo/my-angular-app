import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators, AbstractControl, FormArray } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { StorageService } from '../../core/services/storage.service';
import { Task, TaskStatus, TaskPriority } from '../../shared/interfaces/task.interface';
import { noPastDueValidator, taskTitleValidator, minLengthValidator } from '../../shared/validators/task.validators';

@Component({
  selector: 'app-task-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterLink],
  templateUrl: './task-detail.component.html',
  styleUrl: './task-detail.component.scss'
})
export class TaskDetailComponent implements OnInit {
  private destroy$ = new Subject<void>();

  taskForm!: FormGroup;
  taskId: string | null = null;
  isEditing: boolean = false;
  currentTask: Task | null = null;
  loading: boolean = true;

  statuses = [
    { value: TaskStatus.TODO, label: 'To Do' },
    { value: TaskStatus.IN_PROGRESS, label: 'In Progress' },
    { value: TaskStatus.DONE, label: 'Done' }
  ];

  priorities = [
    { value: TaskPriority.LOW, label: 'Low' },
    { value: TaskPriority.MEDIUM, label: 'Medium' },
    { value: TaskPriority.HIGH, label: 'High' }
  ];

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private storageService: StorageService
  ) {}

  ngOnInit(): void {
    this.taskForm = this.fb.group({
      title: ['', [Validators.required, taskTitleValidator()]],
      description: [''],
      status: [TaskStatus.TODO, Validators.required],
      priority: [TaskPriority.MEDIUM, Validators.required],
      dueDate: [null, []],
      tags: this.fb.array([])
    });

    // Custom validators after form creation
    const titleControl = this.taskForm.get('title');
    if (titleControl) {
      titleControl.setValidators([Validators.required, taskTitleValidator()]);
      titleControl.updateValueAndValidity();
    }

    const dueDateControl = this.taskForm.get('dueDate');
    if (dueDateControl) {
      dueDateControl.setValidators([noPastDueValidator()]);
      dueDateControl.updateValueAndValidity();
    }

    this.route.paramMap.pipe(takeUntil(this.destroy$)).subscribe(params => {
      this.taskId = params.get('id');
      
      if (this.taskId) {
        // Editing existing task
        this.isEditing = true;
        this.loadTask(this.taskId);
      } else {
        // Creating new task - reset form
        this.resetForm();
      }
      
      this.loading = false;
    });

    // Listen for tag changes dynamically
    const tagsArray = this.getTagsArray();
    tagsArray.valueChanges.pipe(takeUntil(this.destroy$)).subscribe(tags => {
      // Remove empty tags
      const filteredTags = tags.filter((tag: string) => tag.trim() !== '');
      if (tags.length !== filteredTags.length) {
        tagsArray.setValue(filteredTags);
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private resetForm(): void {
    this.taskForm.reset({
      title: '',
      description: '',
      status: TaskStatus.TODO,
      priority: TaskPriority.MEDIUM,
      dueDate: null,
      tags: []
    });
    this.currentTask = null;
  }

  private loadTask(id: string): void {
    const tasks = this.storageService.getFilteredAndSortedTasks();
    const task = tasks.find(t => t.id === id);

    if (task) {
      this.currentTask = task;
      
      // Populate form with existing data
      this.taskForm.patchValue({
        title: task.title,
        description: task.description,
        status: task.status,
        priority: task.priority,
        dueDate: task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : null,
        tags: task.tags
      });
    } else {
      this.router.navigate(['/tasks']);
    }
  }

  getTagsArray(): FormArray {
    return this.taskForm.get('tags') as FormArray;
  }

  addTag(): void {
    const tagsArray = this.getTagsArray();
    tagsArray.push(this.fb.control(''));
  }

  removeTag(index: number): void {
    const tagsArray = this.getTagsArray();
    if (index >= 0 && index < tagsArray.length) {
      tagsArray.removeAt(index);
    }
  }

  getTagControls(): any[] {
    return this.getTagsArray().controls;
  }

  onSubmit(): void {
    if (this.taskForm.invalid) {
      this.taskForm.markAllAsTouched();
      return;
    }

    const formData = this.taskForm.value;

    // Validate due date
    if (formData.dueDate) {
      const selectedDate = new Date(formData.dueDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (selectedDate < today) {
        alert('Due date cannot be in the past');
        return;
      }
    }

    const taskData: Omit<Task, 'id' | 'createdDate'> = {
      title: formData.title.trim(),
      description: formData.description.trim(),
      status: formData.status as TaskStatus,
      priority: formData.priority as TaskPriority,
      dueDate: formData.dueDate ? new Date(formData.dueDate) : null,
      tags: formData.tags.filter((tag: string) => tag.trim() !== '').map((tag: string) => tag.trim())
    };

    if (this.isEditing && this.currentTask) {
      // Update existing task - preserve ID and createdDate
      const updatedTask: Task = {
        ...this.currentTask,
        ...taskData
      };
      this.storageService.updateTask(updatedTask);
    } else {
      // Create new task
      this.storageService.addTask(taskData);
    }

    // Navigate to task list
    this.router.navigate(['/tasks']);
  }

  onCancel(): void {
    this.router.navigate(['/tasks']);
  }

  onDelete(): void {
    if (this.isEditing && this.currentTask) {
      const confirmDelete = confirm(`Are you sure you want to delete "${this.currentTask.title}"?`);
      
      if (confirmDelete) {
        this.storageService.deleteTask(this.currentTask.id);
        this.router.navigate(['/tasks']);
      }
    }
  }

  get titleControl() { return this.taskForm.get('title'); }
  get descriptionControl() { return this.taskForm.get('description'); }
  get statusControl() { return this.taskForm.get('status'); }
  get priorityControl() { return this.taskForm.get('priority'); }
  get dueDateControl() { return this.taskForm.get('dueDate'); }

  hasError(control: any, errorType: string): boolean {
    return control?.hasError(errorType) && control?.touched;
  }

  getErrorMessage(control: any, errorType: string): string {
    switch (errorType) {
      case 'required':
        return 'This field is required';
      case 'minlength':
        const minLength = control.errors?.[errorType]?.requiredLength || 3;
        return `Must be at least ${minLength} characters`;
      case 'pastDue':
        return 'Due date cannot be in the past';
      default:
        return 'Invalid value';
    }
  }

  formatDate(dateString: string | null): string {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }
}
