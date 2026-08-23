import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService, User, UserStatus } from '../auth/auth';

@Component({
  selector: 'app-user-account',
  imports: [],
  templateUrl: './user-account.html',
  styleUrl: './user-account.css',
})
export class UserAccount {
  private authService = inject(AuthService);
  private router = inject(Router);

  get currentUser(): User | null {
    return this.authService.user();
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  formatUserStatus(status: UserStatus): string {
    const statusMap: Record<UserStatus, string> = {
      'planned': 'Planned',
      'ready': 'Ready',
      'in_work': 'In Work',
      'completed': 'Completed'
    };
    return statusMap[status] || status;
  }
}
