import { Routes } from '@angular/router';

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
  { path: '', component: Home },
  { path: 'departments', component: Departments },
  { path: 'sub-departments', component: SubDepartmentsComponent },
  { path: 'locations', component: Locations },
  { path: 'shifts', component: Shifts },
  { path: 'schedules', component: Schedules },
  { path: 'positions&levels', component:PositionsLevels },

  { path: 'users', component: Users },
  { path: 'profile', component: Profile },
  { path: 'swap-config', component: SwapConfig },
  { path: 'swap-requests', component: SwapRequests },
  { path: 'calendar-view', component: CalendarView },
  { path: 'login', component:Login },
  { path: '**', component: NotFound },
];
