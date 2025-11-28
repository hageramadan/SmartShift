import { CommonModule } from '@angular/common';
import { Component  ,Input, HostListener} from '@angular/core';
import { Router, RouterModule , ActivatedRoute  } from '@angular/router';
import { AuthService } from '../../services/auth.service';


@Component({
  selector: 'app-sidebar',
  imports: [RouterModule , CommonModule],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css',
})


export class Sidebar {
    constructor(private router: Router, private authService: AuthService) {}
 @Input() isSidebarOpen!: boolean;
  @Input() screenWidth!: number;

  closeOnMobile() {
    if (this.screenWidth < 1020) {
      this.isSidebarOpen = false;
    }
  }

  links = [
    { path: '/', label: 'Home', icon: 'fa-solid fa-house' },
    { path: '/departments', label: 'Departments', icon: 'fa-solid fa-hospital' },
    { path: '/sub-departments', label: 'Sub-Departments', icon: 'fa-solid fa-clipboard-list' },
    { path: '/locations', label: 'Locations', icon: 'fa-solid fa-map-marker-alt' },
    { path: '/shifts', label: 'Shifts', icon: 'fa-solid fa-clock' },
    { path: '/schedules', label: 'Schedules', icon: 'fa-solid fa-calendar-days' },
    { path: '/users', label: 'Users', icon: 'fa-solid fa-users' },
    { path: '/positions&levels', label: 'Positions&levels', icon: 'fa-solid fa-briefcase' },
    // { path: '/profile', label: 'My Profile', icon: 'fa-solid fa-user' },
    // { path: '/swap-config', label: 'Swap Config', icon: 'fa-solid fa-retweet' },
    { path: '/swap-requests', label: 'Swap Requests', icon: 'fa-solid fa-exchange-alt' },
    { path: '/calendar-view', label: 'Calendar View', icon: 'fa-solid fa-calendar' },
  ];
  isLinkActive(path: string): boolean {
  return this.router.isActive(path, {
    paths: 'exact',
    queryParams: 'ignored',
    fragment: 'ignored',
    matrixParams: 'ignored',
  });
  }
  logout() {
    this.authService.logout();
    this.closeOnMobile();
    // this.router.navigate(['/login']);
  }
}
