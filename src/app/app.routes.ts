import { Routes } from '@angular/router';
import { AuthGuard } from './auth/auth.guard'; 

export const routes: Routes = [
  {
    path: 'welcome',
    loadComponent: () =>
      import('./welcome/welcome.page').then((m) => m.WelcomePage),
  },
  {
    path: 'login',
    loadComponent: () =>
      import('./auth/login/login.page').then((m) => m.LoginPage),
  },
  {
    path: 'signup',
    loadComponent: () =>
      import('./auth/signup/signup.page').then((m) => m.SignupPage),
  },
  {
    path: 'dashboard',
    loadComponent: () =>
      import('./dashboard/dashboard.page').then((m) => m.DashboardPage),
    canActivate: [AuthGuard], 
  },
  
  // --- THIS IS THE NEW ROUTE FOR YOUR PAGE ---
  {
    path: 'pets',
    loadComponent: () =>
      import('./pets/pet-list/pet-list.page').then((m) => m.PetListPage),
    canActivate: [AuthGuard],
  },
  // --- END OF NEW ROUTE ---

  {
    path: 'pets/:id',
    loadComponent: () =>
      import('./pets/pet-detail/pet-detail.page').then((m) => m.PetDetailPage),
    canActivate: [AuthGuard], 
  },


  {
    path: 'health',
    loadComponent: () => 
      import('./health/health-records/health-records.page').then(m => m.HealthRecordsPage),
    canActivate: [AuthGuard]
  },
  {
    path: 'reminders',
    loadComponent: () => 
      import('./reminders/reminder-list/reminder-list.page').then(m => m.ReminderListPage),
    canActivate: [AuthGuard]
  },
  // {
  //   path: 'vets-map',
  //   loadComponent: () => 
  //     import('./vets-map/vets-map.page').then(m => m.VetsMapPage), // We will create this next
  //   canActivate: [AuthGuard]
  // },
  
  {
    path: '',
    redirectTo: 'welcome', 
    pathMatch: 'full',
  },
  {
    path: 'home',
    loadComponent: () => import('./home/home.page').then((m) => m.HomePage),
  },
  {
    path: 'health-records',
    loadComponent: () => import('./health/health-records/health-records.page').then( m => m.HealthRecordsPage)
  },
  {
    path: 'reminder-list',
    loadComponent: () => import('./reminders/reminder-list/reminder-list.page').then( m => m.ReminderListPage)
  },
  {
    path: 'vets-map',
    loadComponent: () => import('./pages/vets-map/vets-map.page').then( m => m.VetsMapPage)
  },
];