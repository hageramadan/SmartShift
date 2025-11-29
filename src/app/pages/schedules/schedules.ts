// schedules.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
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

  // إعدادات الـ Modal الموحد
  showCreateModal = false;
  createMode: 'single' | 'bulk' = 'single';
  bulkCreateStep = 1;
  bulkCreateData = {
    dates: [] as string[],
    userIds: [] as string[],
    departmentId: '',
    shiftId: '',
    subDepartmentId: ''
  };

  // إضافة خصائص للمساعدة في الواجهة
  selectedDates: string[] = [];
  dateRange = {
    start: '',
    end: ''
  };

  loading = false;
  dataLoading = false;
  error = '';

  // إضافة متغيرات للتحقق من الصحة
  formErrors = {
    date: '',
    departmentId: '',
    userId: '',
    shiftId: '',
    subDepartmentId: ''
  };

  // إضافة form errors للإنشاء المتعدد
  bulkFormErrors = {
    dates: '',
    userIds: '',
    departmentId: '',
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
    private sharedService: SharedService,
    private toastr: ToastrService
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
    this.schedulesService.getShiftsForSchedules().subscribe({
      next: (response) => {
        this.shifts = response.data || [];
        console.log('✅ Shifts loaded for schedules:', this.shifts.length);
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

  // فتح الـ Modal الموحد
  openCreateModal(): void {
    this.showCreateModal = true;
    this.createMode = 'single';
    this.resetNewScheduleForm();
    this.clearBulkFormErrors();
  }

  // إغلاق الـ Modal
  closeModal(): void {
    this.showCreateModal = false;
    this.createMode = 'single';
    this.bulkCreateStep = 1;
    this.resetNewScheduleForm();
    this.clearBulkFormErrors();
  }

  // تغيير وضع الإنشاء
  setCreateMode(mode: 'single' | 'bulk'): void {
    this.createMode = mode;
    if (mode === 'bulk') {
      this.bulkCreateStep = 1;
      this.bulkCreateData = {
        dates: [],
        userIds: [],
        departmentId: '',
        shiftId: '',
        subDepartmentId: ''
      };
      this.selectedDates = [];
      this.dateRange = { start: '', end: '' };
    }
  }

  // دوال التنقل بين الخطوات للـ Bulk
  nextStep(): void {
    if (this.bulkCreateStep < 3) {
      this.bulkCreateStep++;
    }
  }

  previousStep(): void {
    if (this.bulkCreateStep > 1) {
      this.bulkCreateStep--;
    }
  }

  canProceedToNextStep(): boolean {
    switch (this.bulkCreateStep) {
      case 1:
        return this.bulkCreateData.dates.length > 0;
      case 2:
        return this.bulkCreateData.userIds.length > 0 &&
               !!this.bulkCreateData.departmentId &&
               !!this.bulkCreateData.shiftId &&
               !!this.bulkCreateData.subDepartmentId;
      default:
        return true;
    }
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

    // إعادة تعيين القيم المختارة في الـ modal
    this.newSchedule.subDepartmentId = '';
    this.newSchedule.userId = '';

    // تنظيف أخطاء التحقق
    this.clearFormErrors();
  }

  // إنشاء نطاق من التواريخ
  generateDateRange(): void {
    if (!this.dateRange.start || !this.dateRange.end) {
      this.bulkFormErrors.dates = 'Both start and end dates are required';
      return;
    }

    const start = new Date(this.dateRange.start);
    const end = new Date(this.dateRange.end);

    if (start > end) {
      this.bulkFormErrors.dates = 'Start date cannot be after end date';
      return;
    }

    this.selectedDates = [];
    const currentDate = new Date(start);

    while (currentDate <= end) {
      this.selectedDates.push(currentDate.toISOString().split('T')[0]);
      currentDate.setDate(currentDate.getDate() + 1);
    }

    this.bulkCreateData.dates = [...this.selectedDates];
    this.bulkFormErrors.dates = '';
  }

  // عند تغيير نطاق التاريخ
  onDateRangeChange(): void {
    if (this.dateRange.start && this.dateRange.end) {
      this.generateDateRange();
    }
  }

  // إضافة/إزالة التواريخ
  toggleDate(date: string): void {
    const index = this.bulkCreateData.dates.indexOf(date);
    if (index > -1) {
      this.bulkCreateData.dates.splice(index, 1);
    } else {
      this.bulkCreateData.dates.push(date);
    }
  }

  // إضافة/إزالة المستخدمين
  toggleUser(userId: string): void {
    const index = this.bulkCreateData.userIds.indexOf(userId);
    if (index > -1) {
      this.bulkCreateData.userIds.splice(index, 1);
    } else {
      this.bulkCreateData.userIds.push(userId);
    }
  }

  // تحديد/إلغاء تحديد جميع المستخدمين
  toggleAllUsers(): void {
    if (this.bulkCreateData.userIds.length === this.filteredUsers.length) {
      this.bulkCreateData.userIds = [];
    } else {
      this.bulkCreateData.userIds = this.filteredUsers.map(user => user._id!);
    }
  }

  // تحديد/إلغاء تحديد جميع التواريخ
  toggleAllDates(): void {
    if (this.bulkCreateData.dates.length === this.selectedDates.length) {
      this.bulkCreateData.dates = [];
    } else {
      this.bulkCreateData.dates = [...this.selectedDates];
    }
  }

  // عند تغيير القسم في نافذة الإنشاء المتعدد
  onBulkDepartmentChange(): void {
    if (this.bulkCreateData.departmentId) {
      this.filteredUsers = this.users.filter(
        user => user.departmentId === this.bulkCreateData.departmentId
      );
    } else {
      this.filteredUsers = [...this.users];
    }

    // إعادة تعيين المستخدمين المختارين
    this.bulkCreateData.userIds = [];
    this.bulkCreateData.subDepartmentId = '';
    this.clearBulkFormErrors();
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

  // التحقق من صحة بيانات الإنشاء المتعدد
  validateBulkCreate(): boolean {
    this.clearBulkFormErrors();
    let isValid = true;

    if (this.bulkCreateData.dates.length === 0) {
      this.bulkFormErrors.dates = 'At least one date is required';
      isValid = false;
    }

    if (this.bulkCreateData.userIds.length === 0) {
      this.bulkFormErrors.userIds = 'At least one user is required';
      isValid = false;
    }

    if (!this.bulkCreateData.departmentId) {
      this.bulkFormErrors.departmentId = 'Department is required';
      isValid = false;
    }

    if (!this.bulkCreateData.shiftId) {
      this.bulkFormErrors.shiftId = 'Shift is required';
      isValid = false;
    }

    if (!this.bulkCreateData.subDepartmentId) {
      this.bulkFormErrors.subDepartmentId = 'Sub Department is required';
      isValid = false;
    }

    return isValid;
  }

  createSchedule(): void {
    if (this.createMode === 'single') {
      this.createSingleSchedule();
    } else {
      this.createBulkSchedules();
    }
  }

  createSingleSchedule(): void {
    if (!this.validateSchedule(this.newSchedule)) {
      this.error = 'Please fix the validation errors before submitting';
      return;
    }

    this.loading = true;
    console.log('➕ Creating single schedule:', this.newSchedule);

    this.schedulesService.createSchedule(this.newSchedule).subscribe({
      next: (response) => {
        this.schedules.unshift(response.data!);
        this.closeModal();
        this.loading = false;
        this.loadSchedules();
        this.toastr.success('Schedule created successfully');
      },
      error: (err) => {
        this.handleError('Failed to create schedule', err);
        this.loading = false;
      }
    });
  }

  // إنشاء جداول متعددة
  createBulkSchedules(): void {
    if (!this.validateBulkCreate()) {
      this.error = 'Please fix the validation errors before submitting';
      return;
    }

    this.loading = true;
    console.log('➕ Creating bulk schedules:', this.bulkCreateData);

    this.schedulesService.createMultipleSchedules(this.bulkCreateData).subscribe({
      next: (response) => {
        this.closeModal();
        this.loading = false;
        this.loadSchedules(); // إعادة تحميل البيانات
        this.error = '';
        this.toastr.success(`Successfully created ${response.data?.length || 0} schedules`);
        console.log('✅ Bulk schedules created successfully:', response);
      },
      error: (err) => {
        this.handleError('Failed to create schedules', err);
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
    this.createMode = 'single';
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
          this.toastr.success('Schedule deleted successfully');
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

  // التحقق مما إذا كان النموذج المتعدد صالح
  isBulkFormValid(): boolean {
    return this.bulkCreateData.dates.length > 0 &&
           this.bulkCreateData.userIds.length > 0 &&
           !!this.bulkCreateData.departmentId &&
           !!this.bulkCreateData.shiftId &&
           !!this.bulkCreateData.subDepartmentId;
  }

  // دوال العرض للبيانات القديمة والجديدة
  getDepartmentDisplay(schedule: ScheduleI): string {
    if (!schedule) return 'No Data';

    const departmentId = schedule.departmentId;

    // إذا فيه department object مباشر (بيانات قديمة)
    if ((schedule as any).department) {
      const dept = (schedule as any).department;
      if (typeof dept === 'string' && dept !== 'null') return dept;
      if (dept?.name && dept.name !== 'null') return dept.name;
    }

    // البحث في الـ departments الحالية
    if (departmentId && departmentId !== 'null') {
      const dept = this.departments.find(d => d._id === departmentId);
      if (dept) return dept.name;
      return `Department (${departmentId.substring(0, 6)}...)`;
    }

    return 'No Department';
  }

 getSubDepartmentDisplay(schedule: ScheduleI): string {
  if (!schedule) return 'No Data';

  const subDepartmentId = schedule.subDepartmentId;

  // إذا فيه subDepartment object مباشر
  if ((schedule as any).subDepartment) {
    const subDept = (schedule as any).subDepartment;
    if (typeof subDept === 'string' && subDept !== 'null') return subDept;
    if (subDept?.name && subDept.name !== 'null') return subDept.name;
  }

  // البحث في الـ subDepartments الحالية
  if (subDepartmentId && subDepartmentId !== 'null') {
    const subDept = this.subDepartments.find(s => s._id === subDepartmentId);
    return subDept?.name || `Sub-Dept (${subDepartmentId.substring(0, 6)}...)`;
  }

  return 'No Sub-Department';
}

  getUserDisplay(schedule: ScheduleI): string {
    if (!schedule) return 'No Data';

    const userId = schedule.userId;

    // إذا فيه user object مباشر
    if ((schedule as any).user) {
      const user = (schedule as any).user;
      if (typeof user === 'string' && user !== 'null') return user;
      if (user?.fullName && user.fullName !== 'null') return user.fullName;
      if (user?.name && user.name !== 'null') return user.name;
    }

    // البحث في الـ users الحالية
    if (userId && userId !== 'null') {
      const user = this.users.find(u => u._id === userId);
      if (user) return user.fullName;
      return `User (${userId.substring(0, 6)}...)`;
    }

    return 'No User';
  }

  getShiftDisplay(schedule: ScheduleI): string {
    if (!schedule) return 'No Data';

    const shiftId = schedule.shiftId;

    // إذا فيه shift object مباشر
    if ((schedule as any).shift) {
      const shift = (schedule as any).shift;
      if (typeof shift === 'string' && shift !== 'null') return shift;
      if (shift?.shiftName && shift.shiftName !== 'null') return shift.shiftName;
      if (shift?.name && shift.name !== 'null') return shift.name;
    }

    // البحث في الـ shifts الحالية
    if (shiftId && shiftId !== 'null') {
      const shift = this.shifts.find(s => s._id === shiftId);
      if (shift) return shift.shiftName;
      return `Shift (${shiftId.substring(0, 6)}...)`;
    }

    return 'No Shift';
  }

  getShiftTypeDisplay(schedule: ScheduleI): string {
    if (!schedule) return '';

    const shiftId = schedule.shiftId;

    // إذا فيه shift object مباشر
    if ((schedule as any).shift) {
      const shift = (schedule as any).shift;
      if (shift?.shiftType && shift.shiftType !== 'null') return shift.shiftType;
    }

    // البحث في الـ shifts الحالية
    if (shiftId && shiftId !== 'null') {
      const shift = this.shifts.find(s => s._id === shiftId);
      if (shift && shift.shiftType !== 'null') return shift.shiftType || '';
    }

    return '';
  }

  getShiftTimeDisplay(schedule: ScheduleI): string {
    if (!schedule) return '';

    const shiftId = schedule.shiftId;

    // إذا فيه shift object مباشر
    if ((schedule as any).shift) {
      const shift = (schedule as any).shift;
      if (shift?.startTimeFormatted && shift?.endTimeFormatted) {
        return `${shift.startTimeFormatted} - ${shift.endTimeFormatted}`;
      }
    }

    // البحث في الـ shifts الحالية
    if (shiftId && shiftId !== 'null') {
      const shift = this.shifts.find(s => s._id === shiftId);
      if (shift) {
        return `${shift.startTimeFormatted || shift.startTime} - ${shift.endTimeFormatted || shift.endTime}`;
      }
    }

    return '';
  }

  // دوال للمساعدة في الـ bulk modal
  getSelectedShiftName(): string {
    if (!this.bulkCreateData.shiftId) return 'Not selected';

    const shift = this.shifts.find(s => s._id === this.bulkCreateData.shiftId);
    if (shift) {
      return `${shift.shiftName} (${shift.shiftType})`;
    }

    return 'Unknown Shift';
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

  // تنظيف أخطاء النموذج المتعدد
  private clearBulkFormErrors(): void {
    this.bulkFormErrors = {
      dates: '',
      userIds: '',
      departmentId: '',
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
