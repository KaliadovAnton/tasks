import { Injectable, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

export type UserStatus = 'planned' | 'ready' | 'in_work' | 'completed';

export interface User {
  id: string;
  username: string;
  email: string;
  departmentId: string;
  firstName: string;
  lastName: string;
  status: UserStatus;
}

export interface LoginResponse {
  user: {
    id: number;
    email: string;
    role: string;
  };
  token: string;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private isAuthenticatedSignal = signal<boolean>(false);
  private userSignal = signal<User | null>(null);
  private availableUsersSignal = signal<User[]>([]);

  private http = inject(HttpClient);
  private router = inject(Router);

  isAuthenticated = this.isAuthenticatedSignal.asReadonly();
  user = this.userSignal.asReadonly();
  availableUsers = this.availableUsersSignal.asReadonly();

  // In-memory token storage
  private authToken: string | null = null;

  getToken(): string | null {
    return this.authToken;
  }

  login(email: string, password: string) {
    // Call the backend login API
    return this.http.post<LoginResponse>('/api/login', { email, password }).subscribe({
      next: (response) => {
        // Store token in memory only
        this.authToken = response.token;
        
        // Fetch user info via HTTP request
        this.fetchCurrentUser();
      },
      error: (err) => {
        console.error('Login failed:', err);
        this.logout();
      }
    });
  }

  logout(): void {
    this.userSignal.set(null);
    this.isAuthenticatedSignal.set(false);
    this.authToken = null;
  }

  private fetchCurrentUser() {
    if (!this.authToken) {
      this.logout();
      return;
    }

    // Make HTTP request to get user info
    this.http.get<User>('/api/me', {
      headers: {
        Authorization: `Bearer ${this.authToken}`
      }
    }).subscribe({
      next: (userData) => {
        this.userSignal.set(userData);
        this.isAuthenticatedSignal.set(true);
        
        // Redirect to tasks page after successful login
        this.router.navigate(['/tasks']);
      },
      error: (err) => {
        console.error('Failed to fetch user info:', err);
        this.logout();
      }
    });
  }

  fetchAvailableUsers(): void {
    // Make HTTP request to get available users
    this.http.get<User[]>('/api/users').subscribe({
      next: (usersData) => {
        this.availableUsersSignal.set(usersData);
      },
      error: (err) => {
        console.error('Failed to fetch available users:', err);
      }
    });
  }

  getAvailableUsers(): User[] {
    return this.availableUsersSignal();
  }
}
