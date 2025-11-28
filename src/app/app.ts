import { Component, signal, HostListener, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Sidebar } from "./components/sidebar/sidebar";
import { CommonModule } from '@angular/common';
import { AuthService } from './services/auth.service';
import { SharedService } from './services/shared.service';
import { take } from 'rxjs';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, Sidebar, CommonModule],
  templateUrl: './app.html',
  styleUrls: ['./app.css']
})
export class App {
  protected readonly title = signal('SmartShift');
  isSidebarOpen = true;
  screenWidth = window.innerWidth;

  constructor(private authService: AuthService, private sharedService: SharedService) { }

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.screenWidth = event.target.innerWidth;
    if (this.screenWidth >= 1020) {
      this.isSidebarOpen = true;
    }
  }

  toggleSidebar() {
    this.isSidebarOpen = !this.isSidebarOpen;
  }

  closeSidebarOnOutside() {
    if (this.screenWidth < 1020) {
      this.isSidebarOpen = false;
    }
  }

    ngOnInit() {
    // Restore user session from backend
    this.authService.fetchCurrentUser().pipe(take(1)).subscribe({
      next: (user) => {
        if (user) {
          // Load shared app data only if user is admin or manager
          if (user?.role === 'admin' || user?.role === 'manager') {
            this.sharedService.loadAll();
          }
        }
      },
      error: () => {
        window.location.href = 'http://localhost:3001/login';
      }
    });
  }
}
