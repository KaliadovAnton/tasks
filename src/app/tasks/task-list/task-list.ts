import { Component, inject, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService, User } from '../../auth/auth';
import { TaskService, Task } from '../task';
import { getPriorityColor, getStatusColor, formatDate, isPastDeadline, isPastStartDeadline } from '../task-utils';

@Component({
  selector: 'app-task-list',
  imports: [FormsModule, RouterLink],
  templateUrl: './task-list.html',
  styleUrl: './task-list.css',
})
export class TaskList implements OnInit {
  private taskService = inject(TaskService);
  private authService = inject(AuthService);
  private router = inject(Router);

  get tasks(): Task[] {
    return this.taskService.tasks();
  }

  newTaskTitle = '';
  newTaskDescription = '';
  newTaskPriority: 'low' | 'medium' | 'high' = 'medium';
  newTaskAssignedTo = '';
  newTaskStartDeadline: string = '';
  newTaskDeadline: string = '';
  availableUsers: User[] = [];

  get currentUser(): string | undefined {
    return this.authService.user()?.username;
  }

  ngOnInit(): void {
    this.loadTasks();
    this.availableUsers = this.authService.getAvailableUsers();
  }

  loadTasks(): void {
    this.taskService.loadTasks();
  }

  addTask(): void {
    if (this.newTaskTitle.trim()) {
      const startDeadline = this.newTaskStartDeadline ? new Date(this.newTaskStartDeadline) : undefined;
      const deadline = this.newTaskDeadline ? new Date(this.newTaskDeadline) : undefined;

      this.taskService.createTask({
        title: this.newTaskTitle,
        description: this.newTaskDescription,
        status: 'pending',
        priority: this.newTaskPriority,
        assignedTo: this.newTaskAssignedTo || this.authService.user()?.username || undefined,
        startDeadline,
        deadline,
      }).then(() => {
        this.newTaskTitle = '';
        this.newTaskDescription = '';
        this.newTaskPriority = 'medium';
        this.newTaskAssignedTo = '';
        this.newTaskStartDeadline = '';
        this.newTaskDeadline = '';
        this.taskService.loadTasks();
      }).catch(err => {
        console.error('Error creating task:', err);
      });
    }
  }

  updateTaskStatus(taskId: string, status: Task['status']): void {
    this.taskService.updateTask(taskId, { status }).then(() => {
      this.taskService.loadTasks();
    }).catch(err => {
      console.error('Error updating task status:', err);
    });
  }

  deleteTask(taskId: string): void {
    if (confirm('Are you sure you want to delete this task?')) {
      this.taskService.deleteTask(taskId).then(() => {
        this.taskService.loadTasks();
      }).catch(err => {
        console.error('Error deleting task:', err);
      });
    }
  }

  reassignTask(taskId: string, newAssigneeUsername: string): void {
    if (newAssigneeUsername) {
      this.taskService.updateTask(taskId, { assignedTo: newAssigneeUsername }).then(() => {
        this.taskService.loadTasks();
      }).catch(err => {
        console.error('Error reassigning task:', err);
      });
    } else {
      // Remove assignment
      this.taskService.updateTask(taskId, { assignedTo: undefined }).then(() => {
        this.taskService.loadTasks();
      }).catch(err => {
        console.error('Error reassigning task:', err);
      });
    }
  }

  getPriorityColorDisplay(priority: string): string {
    return getPriorityColor(priority);
  }

  getStatusColorDisplay(status: string): string {
    return getStatusColor(status);
  }

  formatDateDisplay(date: Date | undefined): string {
    return formatDate(date);
  }

  isPastDeadlineDisplay(task: Task): boolean {
    return isPastDeadline(task);
  }

  isPastStartDeadlineDisplay(task: Task): boolean {
    return isPastStartDeadline(task);
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  // State for expanded task details panel
  expandedTaskId: string | null = null;

  toggleTaskDetails(taskId: string): void {
    if (this.expandedTaskId === taskId) {
      this.expandedTaskId = null;
    } else {
      this.expandedTaskId = taskId;
    }
  }

  get expandedTask(): Task | undefined {
    if (!this.expandedTaskId) return undefined;
    return this.tasks.find(t => t.id === this.expandedTaskId);
  }

  navigateToTaskDetail(taskId: string): void {
    this.router.navigate([`/tasks/${taskId}`]);
  }
}
