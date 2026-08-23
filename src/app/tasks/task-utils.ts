import { Task } from './task';

export function getPriorityColor(priority: string): string {
  switch (priority) {
    case 'high': return '#ff5252';
    case 'medium': return '#ffb74d';
    case 'low': return '#81c784';
    default: return '#ccc';
  }
}

export function getStatusColor(status: string): string {
  switch (status) {
    case 'completed': return '#4caf50';
    case 'in-progress': return '#2196f3';
    case 'pending': return '#ff9800';
    default: return '#ccc';
  }
}

export function formatDate(date: Date | undefined): string {
  if (!date) return 'Not set';
  const d = new Date(date);
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

export function isPastDeadline(task: Task): boolean {
  if (!task.deadline || task.status === 'completed') return false;
  return new Date() > new Date(task.deadline);
}

export function isPastStartDeadline(task: Task): boolean {
  if (!task.startDeadline || task.status === 'completed' || task.status === 'in-progress') return false;
  return new Date() > new Date(task.startDeadline);
}
