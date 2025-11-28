import { CommonModule } from '@angular/common';
import { Component, Input, Output, EventEmitter, HostListener, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-sidebar',
  imports: [RouterModule, CommonModule],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css',
})
export class Sidebar implements OnInit {
  constructor(private router: Router, public authService: AuthService) {}

  @Input() isSidebarOpen!: boolean;
  @Input() screenWidth!: number;
  @Output() toggleSidebar = new EventEmitter<void>();

  currentUser: any = null;

  // الروابط بعد إزالة My Profile و Swap Config
  links = [
    { path: '/', label: 'Home', icon: 'fa-solid fa-house' },
    { path: '/departments', label: 'Departments', icon: 'fa-solid fa-hospital' },
    { path: '/sub-departments', label: 'Sub-Departments', icon: 'fa-solid fa-clipboard-list' },
    { path: '/locations', label: 'Locations', icon: 'fa-solid fa-map-marker-alt' },
    { path: '/shifts', label: 'Shifts', icon: 'fa-solid fa-clock' },
    { path: '/schedules', label: 'Schedules', icon: 'fa-solid fa-calendar-days' },
    { path: '/users', label: 'Users', icon: 'fa-solid fa-users' },
    { path: '/positions&levels', label: 'Positions & Levels', icon: 'fa-solid fa-briefcase' },
    { path: '/swap-requests', label: 'Swap Requests', icon: 'fa-solid fa-exchange-alt' },
    { path: '/calendar-view', label: 'Calendar View', icon: 'fa-solid fa-calendar' },
  ];

  ngOnInit() {
    this.loadCurrentUser();
  }

  loadCurrentUser() {
    this.currentUser = this.authService.getCurrentUser();
    console.log('Current User:', this.currentUser);
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    if (event.target.innerWidth >= 1020 && !this.isSidebarOpen) {
      this.openSidebar();
    }
  }

  onToggleSidebar() {
    this.toggleSidebar.emit();
  }

  openSidebar() {
    if (!this.isSidebarOpen) {
      this.toggleSidebar.emit();
    }
  }

  closeSidebar() {
    if (this.isSidebarOpen) {
      this.toggleSidebar.emit();
    }
  }

  closeOnMobile() {
    if (this.screenWidth < 1020) {
      this.closeSidebar();
    }
  }

  isLinkActive(path: string): boolean {
    return this.router.isActive(path, {
      paths: 'exact',
      queryParams: 'ignored',
      fragment: 'ignored',
      matrixParams: 'ignored',
    });
  }

  getUserInitial(): string {
    if (!this.currentUser) {
      this.loadCurrentUser();
    }
    
    const user = this.currentUser;
    if (user?.firstName) {
      return user.firstName.charAt(0).toUpperCase();
    } else if (user?.fullName) {
      return user.fullName.charAt(0).toUpperCase();
    } else if (user?.email) {
      return user.email.charAt(0).toUpperCase();
    }
    return 'U';
  }

  getUserName(): string {
    if (!this.currentUser) {
      this.loadCurrentUser();
    }
    
    const user = this.currentUser;
    if (user?.fullName) {
      return user.fullName;
    } else if (user?.firstName && user?.lastName) {
      return `${user.firstName} ${user.lastName}`;
    } else if (user?.firstName) {
      return user.firstName;
    } else if (user?.email) {
      return user.email;
    }
    return 'User';
  }

  getUserRole(): string {
    if (!this.currentUser) {
      this.loadCurrentUser();
    }
    
    const user = this.currentUser;
    if (user?.role) {
      return user.role;
    }
    return 'user';
  }

  logout() {
    this.authService.logout();
    this.closeOnMobile();
    this.router.navigate(['/login']);
  }
}