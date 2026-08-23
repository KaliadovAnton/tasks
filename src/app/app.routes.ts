import { Routes } from '@angular/router';
import { Login } from './login/login';
import { TaskList } from './tasks/task-list/task-list';
import { TaskDetail } from './tasks/task-detail/task-detail';
import { ResourceList } from './resources/resource-list/resource-list';
import { ResourceDetail } from './resources/resource-detail/resource-detail';
import { UserAccount } from './user-account/user-account';
import { UserCreation } from './user-creation/user-creation';
import { authGuard } from './auth/auth-guard';

export const routes: Routes = [
  { path: 'login', component: Login },
  { 
    path: 'tasks/:id', 
    component: TaskDetail,
    canActivate: [authGuard]
  },
  { 
    path: 'tasks', 
    component: TaskList,
    canActivate: [authGuard]
  },
  { 
    path: 'resources/:id', 
    component: ResourceDetail,
    canActivate: [authGuard]
  },
  { 
    path: 'resources', 
    component: ResourceList,
    canActivate: [authGuard]
  },
  { 
    path: 'account', 
    component: UserAccount,
    canActivate: [authGuard]
  },
  { 
    path: 'users/create', 
    component: UserCreation,
    canActivate: [authGuard]
  },
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: '**', redirectTo: '/login' }
];
