import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { SharedService } from '../../services/shared.service';
import { CrudService } from '../../services/crud.service';
import { UserI } from '../../models/user-i';
import { format, addDays, parseISO } from 'date-fns';
import { SwapService } from '../../services/swap.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-home',
  imports: [CommonModule, RouterModule],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home implements OnInit {
  currentUser: UserI | null = null;
  currentDate = '';

  // Stats
  totalUsers = 0;
  totalDepartments = 0;
  schedulesToday = 0;
  pendingSwaps = 0;
  activeUsers = 0;
  schedulesThisWeek = 0;

  // Recent Activity
  recentSwapRequests: any[] = [];
  upcomingSchedules: any[] = [];
  lowStaffingAlerts: any[] = [];
  recentUsers: any[] = [];

  // Department stats (for admin)
  departmentStats: any[] = [];

  loading = true;

  constructor(
    private shared: SharedService,
    private crud: CrudService,
    private swapService: SwapService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.currentDate = format(new Date(), 'EEEE, MMMM dd, yyyy');
    this.authService.currentUser$.subscribe(user => {
      if (user) {
        this.currentUser = user;
        this.shared.loadAll();
        this.loadAllData();
      }
    });
  }

  async loadAllData() {
    this.loading = true;
    await Promise.all([
      this.loadUsers(),
      this.loadDepartments(),
      this.loadTodaySchedules(),
      this.loadPendingSwaps(),
      this.loadWeekSchedules(),
      this.loadRecentActivity(),
      this.loadUpcomingSchedules(),
      this.loadDepartmentStats(),
      this.checkLowStaffing()
    ]);
    this.loading = false;
  }

  /** Users */
  loadUsers() {
    return new Promise<void>((resolve) => {
      this.shared.getUsers().subscribe((users) => {
        const filteredUsers = this.currentUser?.role === 'manager'
          ? users.filter(u => u.departmentId === this.currentUser?.departmentId)
          : users;

        this.totalUsers = filteredUsers.length;
        this.activeUsers = filteredUsers.filter(u => u.isActive == true).length;

        // Recent users (last 7 days)
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        this.recentUsers = users
          .filter(u => u.createdAt && new Date(u.createdAt) > weekAgo)
          .slice(0, 5);

        resolve();
      });
    });
  }

  /** Departments */
  loadDepartments() {
    return new Promise<void>((resolve) => {
      this.shared.getDepartments().subscribe((depts) => {
        this.totalDepartments = depts.length;
        resolve();
      });
    });
  }

  /** Today's Schedules */
  loadTodaySchedules() {
    const today = format(new Date(), 'yyyy-MM-dd');
    return new Promise<void>((resolve) => {
      this.crud.getAll('schedules', {
        date: today,
        departmentId: this.currentUser?.role === 'manager'
          ? this.currentUser.departmentId
          : undefined,
      }).subscribe((res) => {
        this.schedulesToday = res.data?.length || 0;
        resolve();
      });
    });
  }

  /** This Week's Schedules */
  loadWeekSchedules() {
    const today = new Date();
    const endOfWeek = addDays(today, 7);

    return new Promise<void>((resolve) => {
      this.crud.getAll('schedules', {
        startDate: format(today, 'yyyy-MM-dd'),
        endDate: format(endOfWeek, 'yyyy-MM-dd'),
        departmentId: this.currentUser?.role === 'manager'
          ? this.currentUser.departmentId
          : undefined,
      }).subscribe((res) => {
        this.schedulesThisWeek = res.data?.length || 0;
        resolve();
      });
    });
  }

  /** Pending Swap Requests */
  loadPendingSwaps() {
    return new Promise<void>((resolve) => {
      this.swapService.getAllRequests({
        status: 'pending',
        departmentId: this.currentUser?.role === 'manager'
          ? this.currentUser.departmentId
          : undefined,
      }).subscribe((res) => {
        this.pendingSwaps = res.data?.length || 0;
        resolve();
      });
    });
  }

  /** Recent Swap Requests Activity */
  loadRecentActivity() {
    return new Promise<void>((resolve) => {
      this.swapService.getAllRequests({
        limit: 5,
        departmentId: this.currentUser?.role === 'manager'
          ? this.currentUser.departmentId
          : undefined,
      }).subscribe((res) => {
        this.recentSwapRequests = (res.data || []).slice(0, 5);
        resolve();
      });
    });
  }

  /** Upcoming Schedules (next 3 days) */
  loadUpcomingSchedules() {
    const today = new Date();
    const threeDaysLater = addDays(today, 3);

    return new Promise<void>((resolve) => {
      this.crud.getAll('schedules', {
        startDate: format(today, 'yyyy-MM-dd'),
        endDate: format(threeDaysLater, 'yyyy-MM-dd'),
        departmentId: this.currentUser?.role === 'manager'
          ? this.currentUser.departmentId
          : undefined,
      }).subscribe((res) => {
        this.upcomingSchedules = (res.data || []).slice(0, 6);
        resolve();
      });
    });
  }

  /** Department Performance Stats (Admin only) */
  loadDepartmentStats() {
    if (this.currentUser?.role !== 'admin') {
      return Promise.resolve();
    }

    return new Promise<void>((resolve) => {
      this.shared.getDepartments().subscribe((depts) => {
        this.shared.getUsers().subscribe((users) => {
          const today = format(new Date(), 'yyyy-MM-dd');

          this.crud.getAll('schedules', { date: today }).subscribe((res) => {
            const schedules = res.data || [];

            this.departmentStats = depts.map(dept => {
              const deptUsers = users.filter(u => u.departmentId === dept.id);
              const deptSchedules = schedules.filter((s: any) =>
                deptUsers.some(u => u.id === s.userId)
              );

              return {
                name: dept.name,
                totalStaff: deptUsers.length,
                scheduledToday: deptSchedules.length,
                utilizationRate: deptUsers.length > 0
                  ? Math.round((deptSchedules.length / deptUsers.length) * 100)
                  : 0
              };
            });

            resolve();
          });
        });
      });
    });
  }

  /** Check for Low Staffing Alerts */
  checkLowStaffing() {
    const today = new Date();
    const nextWeek = addDays(today, 7);

    return new Promise<void>((resolve) => {
      this.crud.getAll('schedules', {
        startDate: format(today, 'yyyy-MM-dd'),
        endDate: format(nextWeek, 'yyyy-MM-dd'),
        departmentId: this.currentUser?.role === 'manager'
          ? this.currentUser.departmentId
          : undefined,
      }).subscribe((res) => {
        const schedules = res.data || [];

        // Group by date
        const schedulesByDate: any = {};
        schedules.forEach((schedule: any) => {
          const date = schedule.date;
          if (!schedulesByDate[date]) {
            schedulesByDate[date] = [];
          }
          schedulesByDate[date].push(schedule);
        });

        // Check for dates with low coverage (less than 3 staff)
        this.lowStaffingAlerts = Object.keys(schedulesByDate)
          .filter(date => schedulesByDate[date].length < 3)
          .map(date => ({
            date,
            staffCount: schedulesByDate[date].length
          }))
          .slice(0, 3);

        resolve();
      });
    });
  }

  getStatusClass(status: string): string {
    const classes: any = {
      pending: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
      active: 'bg-green-100 text-green-800'
    };
    return classes[status] || 'bg-gray-100 text-gray-800';
  }

  formatDate(date: string): string {
    try {
      return format(parseISO(date), 'MMM dd, yyyy');
    } catch {
      return date;
    }
  }

  formatScheduleDate(date: string): string {
    try {
      const parsed = parseISO(date);
      return format(parsed, 'MMM dd');
    } catch {
      return date;
    }
  }

  getUtilizationColor(rate: number): string {
    if (rate >= 80) return 'text-green-600';
    if (rate >= 60) return 'text-yellow-600';
    return 'text-red-600';
  }

  getUserInitial(user: any): string {
    return user.firstName?.charAt(0)?.toUpperCase() || 'U';
  }
}
