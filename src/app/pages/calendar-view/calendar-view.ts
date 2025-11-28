import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FullCalendarModule } from '@fullcalendar/angular';
import { CalendarOptions, EventInput } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import { Subject, takeUntil, combineLatest } from 'rxjs';
import { startOfMonth, endOfMonth, format } from 'date-fns';
import { SharedService } from '../../services/shared.service';
import { ScheduleI } from '../../models/schedule-i';
import { DepartmentI } from '../../models/department-i';
import { SubDepartmentI } from '../../models/sub-department-i';
import { ApiResponse } from '../../models/api-response';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-calendar-view',
  standalone: true,
  imports: [CommonModule, FormsModule, FullCalendarModule],
  templateUrl: './calendar-view.html',
  styleUrls: ['./calendar-view.css'],
})
export class CalendarView implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  // User role
  userRole: 'admin' | 'manager' = 'admin';
  userDepartmentId: string = '';

  // Data
  schedules: ScheduleI[] = [];
  departments: DepartmentI[] = [];
  subDepartments: SubDepartmentI[] = [];
  filteredSubDepartments: SubDepartmentI[] = [];

  // Filters
  selectedDepartmentId: string = '';
  selectedSubDepartmentId: string = '';
  currentMonth: Date = new Date();

  // Loading state
  isLoading = false;

  // Calendar
  calendarOptions: CalendarOptions = {
    initialView: 'dayGridMonth',
    plugins: [dayGridPlugin, interactionPlugin],
    height: 'auto',
    headerToolbar: {
      left: 'prev,next today',
      center: 'title',
      right: ''
    },
    eventDisplay: 'block',
    eventColor: '#107c8c',
    eventTextColor: '#fff',
    datesSet: (dateInfo) => {
      this.currentMonth = dateInfo.start;
      this.loadSchedules();
    },
    eventClick: (info) => {
      console.log('Event clicked:', info.event);
    }
  };

  constructor(
    private sharedService: SharedService,
    private toastr: ToastrService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.initializeUserRole();
    this.loadInitialData();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private initializeUserRole(): void {
    const user = this.authService.getCurrentUser();
    if (user) {
      // Check if user.role exists and is either 'admin' or 'manager'
      // Adjust based on how roles are stored in your UserI model
      if (user.role === 'admin' || user.role === 'manager') {
        this.userRole = user.role;
      }

      // For managers, set their department
      if (this.userRole === 'manager' && user.departmentId) {
        this.userDepartmentId = user.departmentId;
        this.selectedDepartmentId = user.departmentId;
      }
    }
  }

  private loadInitialData(): void {
    this.isLoading = true;

    combineLatest([
      this.sharedService.getDepartments(),
      this.sharedService.getSubDepartments()
    ])
    .pipe(takeUntil(this.destroy$))
    .subscribe({
      next: ([departments, subDepartments]) => {
        this.departments = departments;
        this.subDepartments = subDepartments;

        // Filter departments for managers
        if (this.userRole === 'manager' && this.userDepartmentId) {
          this.departments = departments.filter(d => d._id === this.userDepartmentId);
          this.selectedDepartmentId = this.userDepartmentId;
          this.filterSubDepartments();
        }

        this.loadSchedules();
      },
      error: (error) => {
        console.error('Error loading initial data:', error);
        this.toastr.error('Failed to load departments');
        this.isLoading = false;
      }
    });
  }

  loadSchedules(): void {
    this.isLoading = true;

    const startDate = format(startOfMonth(this.currentMonth), 'yyyy-MM-dd');
    const endDate = format(endOfMonth(this.currentMonth), 'yyyy-MM-dd');

    // Build query parameters
    let endpoint = `schedules?startDate=${startDate}&endDate=${endDate}&sort=date`;

    if (this.selectedDepartmentId) {
      endpoint += `&departmentId=${this.selectedDepartmentId}`;
    }

    if (this.selectedSubDepartmentId) {
      endpoint += `&subDepartmentId=${this.selectedSubDepartmentId}`;
    }

    this.sharedService.getAll<ScheduleI[]>(endpoint)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: ApiResponse<ScheduleI[]>) => {
          this.schedules = response.data || [];
          this.updateCalendarEvents();
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error loading schedules:', error);
          this.toastr.error('Failed to load schedules');
          this.isLoading = false;
        }
      });
  }

  private updateCalendarEvents(): void {
    const events: EventInput[] = this.schedules.map(schedule => ({
      id: schedule._id,
      title: this.getEventTitle(schedule),
      start: schedule.date,
      extendedProps: {
        schedule: schedule
      },
      backgroundColor: this.getEventColor(schedule),
      borderColor: this.getEventColor(schedule)
    }));

    this.calendarOptions = {
      ...this.calendarOptions,
      events: events
    };
  }

  private getEventTitle(schedule: ScheduleI): string {
    const userName = schedule.user?.fullName || 'Unknown';
    const shiftName = schedule.shift?.shiftName || 'Shift';
    return `${userName} - ${shiftName}`;
  }

  private getEventColor(schedule: ScheduleI): string {
    const colors = ['#107c8c', '#2563eb', '#7c3aed', '#dc2626', '#ea580c'];
    const index = schedule.shiftId ? schedule.shiftId.charCodeAt(0) % colors.length : 0;
    return colors[index];
  }

  onDepartmentChange(): void {
    this.selectedSubDepartmentId = '';
    this.filterSubDepartments();
    this.loadSchedules();
  }

  onSubDepartmentChange(): void {
    this.loadSchedules();
  }

  private filterSubDepartments(): void {
    if (this.selectedDepartmentId) {
      this.filteredSubDepartments = this.subDepartments.filter(
        sd => sd.departmentId === this.selectedDepartmentId
      );
    } else {
      this.filteredSubDepartments = [];
    }
  }

  getFilteredSchedules(): ScheduleI[] {
    return this.schedules;
  }

  resetFilters(): void {
    if (this.userRole === 'manager') {
      this.selectedSubDepartmentId = '';
    } else {
      this.selectedDepartmentId = '';
      this.selectedSubDepartmentId = '';
      this.filteredSubDepartments = [];
    }
    this.loadSchedules();
  }

  formatShiftTime(schedule: ScheduleI): string {
    if (schedule.shift?.startTimeFormatted && schedule.shift?.endTimeFormatted) {
      return `${schedule.shift.startTimeFormatted} - ${schedule.shift.endTimeFormatted}`;
    }
    return 'Time not available';
  }

  get selectedDepartmentName(): string {
    return this.departments.find(d => d._id === this.selectedDepartmentId)?.name || '';
  }

  get selectedSubDepartmentName(): string {
    return this.subDepartments.find(sd => sd._id === this.selectedSubDepartmentId)?.name || '';
  }

  clearDepartment(): void {
    this.selectedDepartmentId = '';
    this.selectedSubDepartmentId = '';
    this.filteredSubDepartments = [];
    this.loadSchedules();
  }

  clearSubDepartment(): void {
    this.selectedSubDepartmentId = '';
    this.onSubDepartmentChange();
  }
}
