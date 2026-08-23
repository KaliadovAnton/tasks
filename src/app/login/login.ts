import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../auth/auth';

@Component({
  selector: 'app-login',
  imports: [FormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  private authService = inject(AuthService);
  private router = inject(Router);

  username = '';
  password = '';
  errorMessage = '';

  onSubmit(): void {
    const success = this.authService.login(this.username, this.password);
    
    if (success) {
      // Get return URL from query params or default to tasks
      const returnUrl = new URLSearchParams(window.location.search).get('returnUrl') || '/tasks';
      this.router.navigate([returnUrl]);
    } else {
      this.errorMessage = 'Invalid username or password';
    }
  }
}
