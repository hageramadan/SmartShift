import { Routes } from '@angular/router';

import { Home } from './pages/home/home';
import { Departments } from './pages/departments/departments';
import { SubDepartments } from './pages/sub-departments/sub-departments';
import { Locations } from './pages/locations/locations';
import { Shifts } from './pages/shifts/shifts';
import { Schedules } from './pages/schedules/schedules';
import { Users } from './pages/users/users';
import { Profile } from './pages/profile/profile';
import { SwapConfig } from './pages/swap-config/swap-config';
import { SwapRequests } from './pages/swap-requests/swap-requests';
import { CalendarView } from './pages/calendar-view/calendar-view';
import { NotFound } from './components/not-found/not-found';

export const routes: Routes = [
  { path: '', component: Home },
  { path: 'departments', component: Departments },
  { path: 'sub-departments', component: SubDepartments },
  { path: 'locations', component: Locations },
  { path: 'shifts', component: Shifts },
  { path: 'schedules', component: Schedules },
  { path: 'users', component: Users },
  { path: 'profile', component: Profile },
  { path: 'swap-config', component: SwapConfig },
  { path: 'swap-requests', component: SwapRequests },
  { path: 'calendar-view', component: CalendarView },
  { path: '**', component: NotFound },
];
