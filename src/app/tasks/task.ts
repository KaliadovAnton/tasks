import { Injectable, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';

export interface Task {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'in-progress' | 'completed';
  assignedTo?: string;
  priority: 'low' | 'medium' | 'high';
  createdAt: Date;
  startDeadline?: Date; // when it must be started
  deadline?: Date;      // final deadline
  updatedAt: Date;
}

@Injectable({
  providedIn: 'root',
})
export class TaskService {
  private http = inject(HttpClient);
  private apiUrl = '/api/tasks';
  private tasksSignal = signal<Task[]>([]);

  tasks = this.tasksSignal.asReadonly();

  constructor() {
    this.loadTasks();
  }

  getTasks(): Task[] {
    return this.tasksSignal();
  }

  getTaskById(id: string): Task | undefined {
    return this.getTasks().find(task => task.id === id);
  }

  loadTasks(): void {
    this.http.get<Task[]>(this.apiUrl).subscribe({
      next: (tasks) => {
        // Convert string dates to Date objects
        const tasksWithDates = tasks.map(t => ({
          ...t,
          createdAt: t.createdAt ? new Date(t.createdAt) : new Date(),
          updatedAt: t.updatedAt ? new Date(t.updatedAt) : new Date(),
          startDeadline: t.startDeadline ? new Date(t.startDeadline) : undefined,
          deadline: t.deadline ? new Date(t.deadline) : undefined,
        }));
        this.tasksSignal.set(tasksWithDates);
      },
      error: (err) => {
        console.error('Error loading tasks:', err);
      }
    });
  }

  createTask(task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>): Promise<Task> {
    const newTaskData = {
      ...task,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    return this.http.post<Task>(this.apiUrl, newTaskData).toPromise() as Promise<Task>;
  }

  updateTask(id: string, updates: Partial<Task>): Promise<Task | undefined> {
    const updateData: any = { ...updates };
    if (updates.updatedAt) {
      updateData.updatedAt = new Date().toISOString();
    }
    
    // Convert dates to ISO strings for the API
    if (updateData.startDeadline instanceof Date) {
      updateData.startDeadline = updateData.startDeadline.toISOString();
    }
    if (updateData.deadline instanceof Date) {
      updateData.deadline = updateData.deadline.toISOString();
    }

    return this.http.put<Task>(`${this.apiUrl}/${id}`, updateData).toPromise() as Promise<Task>;
  }

  deleteTask(id: string): Promise<boolean> {
    return this.http.delete(`${this.apiUrl}/${id}`).toPromise().then(() => true).catch(() => false);
  }
}
