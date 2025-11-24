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
  
  // إضافة متغيرات للتحقق من الصحة
  formErrors = {
    date: '',
    departmentId: '',
    userId: '',
    shiftId: '',
    subDepartmentId: ''
  };
  
  validationMessages = {
    date: {
      required: 'Date is required',
      future: 'Date cannot be in the past'
    },
    departmentId: {
      required: 'Department is required'
    },
    userId: {
      required: 'User is required'
    },
    shiftId: {
      required: 'Shift is required'
    },
    subDepartmentId: {
      required: 'Sub Department is required'
    }
  };

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
        this.handleError('Failed to load departments', err);
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
        this.handleError('Failed to load subdepartments', err);
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
        this.handleError('Failed to load users', err);
        this.dataLoading = false;
      }
    });

    this.loadShifts();
    this.loadSchedules();
  }

  // دالة للتحقق من اكتمال تحميل البيانات
  checkDataStatus(): void {
    if (
      this.departments.length > 0 &&
      this.subDepartments.length > 0 &&
      this.users.length > 0
    ) {
      this.dataLoading = false;
    }
  }

  loadShifts(): void {
    this.schedulesService.getShifts().subscribe({
      next: (response) => {
        this.shifts = response.data;
      },
      error: (err) => {
        this.handleError('Failed to load shifts', err);
      }
    });
  }

  loadSchedules(): void {
    this.loading = true;
    this.error = '';

    this.schedulesService.getSchedules(this.filters).subscribe({
      next: (response) => {
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
        this.handleError('Failed to load schedules', err);
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
    
    // إعادة تعيين القيم المختارة
    this.filters.subDepartmentId = '';
    this.filters.userId = '';
    
    // تطبيق الفلاتر
    this.applyFilters();
  }

  // دالة خاصة للـ modal
  onModalDepartmentChange(): void {
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
    
    // تنظيف أخطاء التحقق
    this.clearFormErrors();
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

  // التحقق من صحة البيانات قبل الإرسال
  validateSchedule(schedule: CreateScheduleRequest): boolean {
    this.clearFormErrors();
    let isValid = true;

    // التحقق من التاريخ
    if (!schedule.date) {
      this.formErrors.date = this.validationMessages.date.required;
      isValid = false;
    } else {
      const selectedDate = new Date(schedule.date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (selectedDate < today) {
        this.formErrors.date = this.validationMessages.date.future;
        isValid = false;
      }
    }

    // التحقق من القسم
    if (!schedule.departmentId) {
      this.formErrors.departmentId = this.validationMessages.departmentId.required;
      isValid = false;
    }

    // التحقق من المستخدم
    if (!schedule.userId) {
      this.formErrors.userId = this.validationMessages.userId.required;
      isValid = false;
    }

    // التحقق من الوردية
    if (!schedule.shiftId) {
      this.formErrors.shiftId = this.validationMessages.shiftId.required;
      isValid = false;
    }

    // التحقق من القسم الفرعي
    if (!schedule.subDepartmentId) {
      this.formErrors.subDepartmentId = this.validationMessages.subDepartmentId.required;
      isValid = false;
    }

    return isValid;
  }

  createSchedule(): void {
    if (!this.validateSchedule(this.newSchedule)) {
      this.error = 'Please fix the validation errors before submitting';
      return;
    }

    this.loading = true;
    console.log('➕ Creating schedule:', this.newSchedule);

    this.schedulesService.createSchedule(this.newSchedule).subscribe({
      next: (response) => {
        this.schedules.unshift(response.data);
        this.showCreateModal = false;
        this.resetNewScheduleForm();
        this.loading = false;
        this.loadSchedules();
      },
      error: (err) => {
        this.handleError('Failed to create schedule', err);
        this.loading = false;
      }
    });
  }

  updateSchedule(schedule: ScheduleI): void {
    if (!schedule._id) {
      this.error = 'Invalid schedule data';
      return;
    }
    
    // نسخ البيانات إلى نموذج التعديل
    this.newSchedule = {
      date: schedule.date,
      departmentId: schedule.departmentId || '',
      userId: schedule.userId || '',
      shiftId: schedule.shiftId || '',
      subDepartmentId: schedule.subDepartmentId || ''
    };
    
    // تصفية البيانات بناءً على القسم المختار
    this.onModalDepartmentChange();
    this.showCreateModal = true;
  }

  deleteSchedule(id: string): void {
    if (!id) {
      this.error = 'Invalid schedule ID';
      return;
    }

    if (confirm('Are you sure you want to delete this schedule?')) {
      this.loading = true;
      this.schedulesService.deleteSchedule(id).subscribe({
        next: () => {
          this.schedules = this.schedules.filter(s => s._id !== id);
          this.loading = false;
          this.loadSchedules(); // إعادة تحميل البيانات للتأكد من التزامن
        },
        error: (err) => {
          this.handleError('Failed to delete schedule', err);
          this.loading = false;
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

  // معالجة الأخطاء من الباك إند
  private handleError(defaultMessage: string, error: any): void {
    console.error('❌ Error:', error);
    
    if (error.error && error.error.message) {
      // إذا كان الباك إند يرسل رسالة خطأ محددة
      this.error = error.error.message;
    } else if (error.status === 0) {
      this.error = 'Network error: Please check your internet connection';
    } else if (error.status === 400) {
      this.error = 'Bad request: Please check your input data';
    } else if (error.status === 401) {
      this.error = 'Unauthorized: Please login again';
    } else if (error.status === 403) {
      this.error = 'Forbidden: You do not have permission to perform this action';
    } else if (error.status === 404) {
      this.error = 'Resource not found';
    } else if (error.status === 409) {
      this.error = 'Conflict: Schedule already exists for this user and date';
    } else if (error.status === 500) {
      this.error = 'Server error: Please try again later';
    } else {
      this.error = defaultMessage;
    }
  }

  // تنظيف أخطاء التحقق
  private clearFormErrors(): void {
    this.formErrors = {
      date: '',
      departmentId: '',
      userId: '',
      shiftId: '',
      subDepartmentId: ''
    };
  }

  // تغيير من private إلى public لأنها تُستدعى من القالب
  resetNewScheduleForm(): void {
    this.newSchedule = {
      date: '',
      departmentId: '',
      userId: '',
      shiftId: '',
      subDepartmentId: ''
    };
    this.error = '';
    this.clearFormErrors();
  }

  formatDate(dateString: string): string {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (error) {
      return 'Invalid Date';
    }
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
  closeModal(): void {
  this.showCreateModal = false;
  this.resetNewScheduleForm();
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