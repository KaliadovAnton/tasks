import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TaskService, Task } from '../task';
import { getPriorityColor, getStatusColor, formatDate, isPastDeadline, isPastStartDeadline } from '../task-utils';

@Component({
  selector: 'app-task-detail',
  imports: [],
  templateUrl: './task-detail.html',
  styleUrl: './task-detail.css',
})
export class TaskDetail implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private taskService = inject(TaskService);

  task: Task | undefined;
  loading = true;

  ngOnInit(): void {
    const taskId = this.route.snapshot.paramMap.get('id');
    if (taskId) {
      this.task = this.taskService.getTaskById(taskId);
    }
    this.loading = false;
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

  goBack(): void {
    this.router.navigate(['/tasks']);
  }

  updateTaskStatus(status: Task['status']): void {
    if (!this.task) return;
    this.taskService.updateTask(this.task.id, { status }).then((updatedTask) => {
      // Refresh task from service
      if (updatedTask) {
        this.task = this.taskService.getTaskById(this.task!.id);
      }
    }).catch(err => {
      console.error('Error updating task status:', err);
    });
  }

  deleteTask(): void {
    if (!this.task) return;
    if (confirm('Are you sure you want to delete this task?')) {
      this.taskService.deleteTask(this.task.id).then(() => {
        this.router.navigate(['/tasks']);
      }).catch(err => {
        console.error('Error deleting task:', err);
      });
    }
  }
}
