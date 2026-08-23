import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService, UserStatus } from '../auth/auth';

@Component({
  selector: 'app-user-creation',
  imports: [FormsModule],
  templateUrl: './user-creation.html',
  styleUrl: './user-creation.css',
})
export class UserCreation {
  private authService = inject(AuthService);
  private router = inject(Router);

  newUsername = '';
  newEmail = '';
  newFirstName = '';
  newLastName = '';
  newDepartmentId = '';
  newStatus: UserStatus = 'planned';
  errorMessage = '';

  createUser(): void {
    if (!this.newUsername.trim() || !this.newEmail.trim() || !this.newFirstName.trim()) {
      this.errorMessage = 'Username, email, and first name are required.';
      return;
    }

    const newUser = {
      username: this.newUsername,
      email: this.newEmail,
      firstName: this.newFirstName,
      lastName: this.newLastName,
      departmentId: this.newDepartmentId || 'dept-001',
      status: this.newStatus,
    };

    this.authService.addUser(newUser);
    
    // Reset form
    this.newUsername = '';
    this.newEmail = '';
    this.newFirstName = '';
    this.newLastName = '';
    this.newDepartmentId = '';
    this.newStatus = 'planned';
    this.errorMessage = '';

    // Redirect to users list or account page
    this.router.navigate(['/account']);
  }

  cancel(): void {
    this.router.navigate(['/account']);
  }
}
