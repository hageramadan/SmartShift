import { Component, signal , HostListener  } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Sidebar } from "./components/sidebar/sidebar";
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Sidebar ,CommonModule],
  templateUrl: './app.html',
  styleUrls: ['./app.css']  // صححت من styleUrl إلى styleUrls
})
export class App {
  protected readonly title = signal('SmartShift');
  isSidebarOpen = true;
  screenWidth = window.innerWidth;

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
}
