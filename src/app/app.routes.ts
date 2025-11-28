import { Routes } from '@angular/router';
import { authGuard } from './guards/auth-guard';

import { Home } from './pages/home/home';
import { Departments } from './pages/departments/departments';
import {  SubDepartmentsComponent } from './pages/sub-departments/sub-departments';
import { Locations } from './pages/locations/locations';
import { Shifts } from './pages/shifts/shifts';
import { Schedules } from './pages/schedules/schedules';
import { Users } from './pages/users/users';
import { Profile } from './pages/profile/profile';
import { SwapConfig } from './pages/swap-config/swap-config';
import { SwapRequests } from './pages/swap-requests/swap-requests';
import { CalendarView } from './pages/calendar-view/calendar-view';
import { NotFound } from './components/not-found/not-found';
import { Login } from './components/login/login';
import { PositionsLevels } from './pages/positions-levels/positions-levels';

export const routes: Routes = [
  { path: '', component: Home, canActivate: [authGuard] },
  { path: 'departments', component: Departments, canActivate: [authGuard] },
  { path: 'sub-departments', component: SubDepartmentsComponent, canActivate: [authGuard] },
  { path: 'locations', component: Locations, canActivate: [authGuard] },
  { path: 'shifts', component: Shifts, canActivate: [authGuard] },
  { path: 'schedules', component: Schedules, canActivate: [authGuard] },
  { path: 'positions&levels', component: PositionsLevels, canActivate: [authGuard] },

  { path: 'users', component: Users, canActivate: [authGuard] },
  { path: 'profile', component: Profile, canActivate: [authGuard] },
  { path: 'swap-config', component: SwapConfig, canActivate: [authGuard] },
  { path: 'swap-requests', component: SwapRequests, canActivate: [authGuard] },
  { path: 'calendar-view', component: CalendarView, canActivate: [authGuard] },
  { path: 'login', component: Login },
  { path: '**', component: NotFound },
];
