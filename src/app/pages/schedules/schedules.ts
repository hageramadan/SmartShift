// schedules.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SchedulesService, ScheduleFilters } from '../../services/schedules.service';
import { SharedService } from '../../services/shared.service';
import { 
  ScheduleI, 
  CreateScheduleRequest 
} from '../../models/schedule-i';
import { DepartmentI } from '../../models/department-i';
import { SubDepartmentI } from '../../models/sub-department-i';
import { UserI } from '../../models/user-i';
import { ShiftI } from '../../models/shift-i';

@Component({
  selector: 'app-schedules',
  imports: [CommonModule, FormsModule],
  templateUrl: './schedules.html',
  styleUrl: './schedules.css',
})
export class Schedules implements OnInit {
  schedules: ScheduleI[] = [];
  departments: DepartmentI[] = [];
  subDepartments: SubDepartmentI[] = [];
  users: UserI[] = [];
  shifts: ShiftI[] = [];
  filteredSubDepartments: SubDepartmentI[] = [];
  filteredUsers: UserI[] = [];
  
  filters: ScheduleFilters = {
    startDate: '',
    endDate: '',
    departmentId: '',
    subDepartmentId: '',
    userId: '',
    shiftId: '',
    page: 1,
    limit: 10
  };

  newSchedule: CreateScheduleRequest = {
    date: '',
    departmentId: '',
    userId: '',
    shiftId: '',
    subDepartmentId: ''
  };

  loading = false;
  dataLoading = false;
  error = '';
  showCreateModal = false;
  
  pagination = {
    total: 0,
    totalFiltered: 0,
    page: 1,
    limit: 10,
    totalPages: 0
  };

  constructor(
    private schedulesService: SchedulesService,
    private sharedService: SharedService
  ) { }

  ngOnInit(): void {
    console.log('🔵 Schedules Component Initialized');
    this.loadAllData();
  }

  // تحميل جميع البيانات
  loadAllData(): void {
    this.dataLoading = true;
    console.log('🔄 Loading all data...');

    // تحميل البيانات المشتركة أولاً
    this.sharedService.loadAll();
    
    // الاشتراك في جميع البيانات
    this.sharedService.getDepartments().subscribe({
      next: (depts) => {
        console.log('📊 Departments loaded:', depts);
        this.departments = depts;
        this.checkDataStatus();
      },
      error: (err) => {
        console.error('❌ Error loading departments:', err);
        this.error = 'Failed to load departments';
        this.dataLoading = false;
      }
    });

    this.sharedService.getSubDepartments().subscribe({
      next: (subDepts) => {
        console.log('📁 SubDepartments loaded:', subDepts);
        this.subDepartments = subDepts;
        this.filteredSubDepartments = [...subDepts];
        this.checkDataStatus();
      },
      error: (err) => {
        console.error('❌ Error loading subdepartments:', err);
        this.error = 'Failed to load subdepartments';
        this.dataLoading = false;
      }
    });

    this.sharedService.getUsers().subscribe({
      next: (users) => {
        console.log('👥 Users loaded:', users);
        this.users = users;
        this.filteredUsers = [...users];
        this.checkDataStatus();
      },
      error: (err) => {
        console.error('❌ Error loading users:', err);
        this.error = 'Failed to load users';
        this.dataLoading = false;
      }
    });

    this.loadShifts();
    this.loadSchedules();
  }

  // دالة للتحقق من اكتمال تحميل البيانات
  private checkDataStatus(): void {
    console.log('📋 Data Status Check:');
    console.log('   Departments:', this.departments.length);
    console.log('   SubDepartments:', this.subDepartments.length);
    console.log('   Users:', this.users.length);
    
    // إذا اكتمل تحميل جميع البيانات
    if (this.departments.length > 0 && this.subDepartments.length > 0 && this.users.length > 0) {
      this.dataLoading = false;
      console.log('✅ All data loaded successfully');
    }
    
    if (this.departments.length === 0) {
      console.warn('⚠️ No departments loaded!');
    }
    if (this.subDepartments.length === 0) {
      console.warn('⚠️ No subdepartments loaded!');
    }
    if (this.users.length === 0) {
      console.warn('⚠️ No users loaded!');
    }
  }

  loadShifts(): void {
    this.schedulesService.getShifts().subscribe({
      next: (response) => {
        console.log('⏰ Shifts loaded:', response.data);
        this.shifts = response.data;
      },
      error: (err) => {
        console.error('❌ Error loading shifts:', err);
        this.error = 'Failed to load shifts';
      }
    });
  }

  loadSchedules(): void {
    this.loading = true;
    this.error = '';

    console.log('📅 Loading schedules with filters:', this.filters);

    this.schedulesService.getSchedules(this.filters).subscribe({
      next: (response) => {
        console.log('📅 Schedules response:', response);
        this.schedules = response.data || [];
        this.pagination = {
          total: response.total || 0,
          totalFiltered: response.totalFiltered || 0,
          page: response.page || 1,
          limit: response.limit || 10,
          totalPages: Math.ceil((response.total || 0) / (response.limit || 10))
        };
        this.loading = false;
        console.log('✅ Schedules loaded successfully:', this.schedules.length);
      },
      error: (err) => {
        console.error('❌ Error loading schedules:', err);
        this.error = 'Failed to load schedules';
        this.loading = false;
      }
    });
  }

  // إضافة زر Refresh
  refreshData(): void {
    console.log('🔄 Manually refreshing data...');
    this.sharedService.refetchAll();
    this.loadAllData();
  }

  // دالة خاصة بفلترة الـ departments في الفلاتر
  onDepartmentFilterChange(): void {
    console.log('🔄 Filter Department changed to:', this.filters.departmentId);
    
    if (this.filters.departmentId) {
      this.filteredSubDepartments = this.subDepartments.filter(
        sub => {
          const subDeptId = typeof sub.departmentId === 'string' 
            ? sub.departmentId 
            : sub.department?._id;
          return subDeptId === this.filters.departmentId;
        }
      );
      
      this.filteredUsers = this.users.filter(
        user => user.departmentId === this.filters.departmentId
      );
    } else {
      this.filteredSubDepartments = [...this.subDepartments];
      this.filteredUsers = [...this.users];
    }
    
    console.log('📁 Filtered subdepartments:', this.filteredSubDepartments.length);
    console.log('👥 Filtered users:', this.filteredUsers.length);
    
    // إعادة تعيين القيم المختارة
    this.filters.subDepartmentId = '';
    this.filters.userId = '';
    
    // تطبيق الفلاتر
    this.applyFilters();
  }

  // دالة خاصة للـ modal
  onModalDepartmentChange(): void {
    console.log('🔄 Modal Department changed to:', this.newSchedule.departmentId);
    
    if (this.newSchedule.departmentId) {
      // تصفية الـ sub-departments للـ modal
      this.filteredSubDepartments = this.subDepartments.filter(
        sub => {
          const subDeptId = typeof sub.departmentId === 'string' 
            ? sub.departmentId 
            : sub.department?._id;
          return subDeptId === this.newSchedule.departmentId;
        }
      );
      
      // تصفية الـ users للـ modal
      this.filteredUsers = this.users.filter(
        user => user.departmentId === this.newSchedule.departmentId
      );
    } else {
      this.filteredSubDepartments = [...this.subDepartments];
      this.filteredUsers = [...this.users];
    }
    
    console.log('📁 Modal Filtered subdepartments:', this.filteredSubDepartments.length);
    console.log('👥 Modal Filtered users:', this.filteredUsers.length);
    
    // إعادة تعيين القيم المختارة في الـ modal
    this.newSchedule.subDepartmentId = '';
    this.newSchedule.userId = '';
  }

  applyFilters(): void {
    this.filters.page = 1;
    this.loadSchedules();
  }

  resetFilters(): void {
    this.filters = {
      startDate: '',
      endDate: '',
      departmentId: '',
      subDepartmentId: '',
      userId: '',
      shiftId: '',
      page: 1,
      limit: 10
    };
    this.filteredSubDepartments = [...this.subDepartments];
    this.filteredUsers = [...this.users];
    this.loadSchedules();
  }

  createSchedule(): void {
    if (!this.isValidSchedule(this.newSchedule)) {
      this.error = 'Please fill all required fields';
      return;
    }

    this.loading = true;
    console.log('➕ Creating schedule:', this.newSchedule);

    this.schedulesService.createSchedule(this.newSchedule).subscribe({
      next: (response) => {
        console.log('✅ Schedule created:', response);
        this.schedules.unshift(response.data);
        this.showCreateModal = false;
        this.resetNewScheduleForm();
        this.loading = false;
        this.loadSchedules();
      },
      error: (err) => {
        console.error('❌ Error creating schedule:', err);
        this.error = 'Failed to create schedule';
        this.loading = false;
      }
    });
  }

  updateSchedule(schedule: ScheduleI): void {
    if (!schedule._id) return;
    
    // هنا يمكنك فتح modal للتعديل أو استخدام أي طريقة أخرى
    console.log('✏️ Editing schedule:', schedule);
    
    // مثال: نسخ البيانات إلى نموذج التعديل
    this.newSchedule = {
      date: schedule.date,
      departmentId: schedule.departmentId || '',
      userId: schedule.userId || '',
      shiftId: schedule.shiftId || '',
      subDepartmentId: schedule.subDepartmentId || ''
    };
    
    this.showCreateModal = true;
  }

  deleteSchedule(id: string): void {
    if (confirm('Are you sure you want to delete this schedule?')) {
      this.schedulesService.deleteSchedule(id).subscribe({
        next: () => {
          this.schedules = this.schedules.filter(s => s._id !== id);
        },
        error: (err) => {
          this.error = 'Failed to delete schedule';
          console.error('❌ Error deleting schedule:', err);
        }
      });
    }
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.pagination.totalPages) {
      this.filters.page = page;
      this.loadSchedules();
    }
  }

  isValidSchedule(schedule: CreateScheduleRequest): boolean {
    return !!schedule.date && 
           !!schedule.departmentId && 
           !!schedule.userId && 
           !!schedule.shiftId && 
           !!schedule.subDepartmentId;
  }

  private resetNewScheduleForm(): void {
    this.newSchedule = {
      date: '',
      departmentId: '',
      userId: '',
      shiftId: '',
      subDepartmentId: ''
    };
    this.error = '';
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  getDepartmentName(departmentId: string | undefined): string {
    if (!departmentId) return 'Unknown';
    const dept = this.departments.find(d => d._id === departmentId);
    return dept?.name ?? 'Unknown';
  }

  getSubDepartmentName(subDepartmentId: string | undefined): string {
    if (!subDepartmentId) return 'Unknown';
    const subDept = this.subDepartments.find(s => s._id === subDepartmentId);
    return subDept?.name ?? 'Unknown';
  }

  getUserName(userId: string | undefined): string {
    if (!userId) return 'Unknown';
    const user = this.users.find(u => u._id === userId);
    return user?.fullName ?? 'Unknown';
  }

  getShiftName(shiftId: string | undefined): string {
    if (!shiftId) return 'Unknown';
    const shift = this.shifts.find(s => s._id === shiftId);
    return shift?.shiftName ?? 'Unknown';
  }

  getShiftTime(shiftId: string | undefined): string {
    if (!shiftId) return '';
    const shift = this.shifts.find(s => s._id === shiftId);
    if (!shift) return '';
    return `${shift.startTimeFormatted ?? ''} - ${shift.endTimeFormatted ?? ''}`;
  }

  getPageNumbers(): number[] {
    const totalPages = this.pagination.totalPages;
    const currentPage = this.pagination.page;
    const delta = 2;
    const range = [];
    const rangeWithDots = [];

    for (let i = Math.max(2, currentPage - delta); i <= Math.min(totalPages - 1, currentPage + delta); i++) {
      range.push(i);
    }

    if (currentPage - delta > 2) {
      rangeWithDots.push(1);
      if (currentPage - delta > 3) {
        rangeWithDots.push(-1);
      }
    } else {
      rangeWithDots.push(1);
    }

    rangeWithDots.push(...range);

    if (currentPage + delta < totalPages - 1) {
      if (currentPage + delta < totalPages - 2) {
        rangeWithDots.push(-1);
      }
      rangeWithDots.push(totalPages);
    } else if (totalPages > 1) {
      rangeWithDots.push(totalPages);
    }

    return rangeWithDots.filter(page => page === -1 || (page >= 1 && page <= totalPages));
  }
}