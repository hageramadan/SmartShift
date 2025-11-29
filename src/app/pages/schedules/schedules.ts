// schedules.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { Subject, takeUntil } from 'rxjs';

// Services
import { SchedulesService, ScheduleFilters } from '../../services/schedules.service';
import { SharedService } from '../../services/shared.service';
import { AuthService } from '../../services/auth.service';

// Models
import {
  ScheduleI,
  CreateScheduleRequest
} from '../../models/schedule-i';
import { DepartmentI } from '../../models/department-i';
import { SubDepartmentI } from '../../models/sub-department-i';
import { UserI } from '../../models/user-i';
import { ShiftI } from '../../models/shift-i';

// Constants
const PAGINATION_CONFIG = {
  DEFAULT_LIMIT: 10,
  MAX_PAGES_DISPLAY: 7
};

const VALIDATION_MESSAGES = {
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
    required: ''
  }
};

@Component({
  selector: 'app-schedules',
  imports: [CommonModule, FormsModule],
  templateUrl: './schedules.html',
  styleUrl: './schedules.css',
})
export class Schedules implements OnInit, OnDestroy {
  // Data Arrays
  schedules: ScheduleI[] = [];
  departments: DepartmentI[] = [];
  subDepartments: SubDepartmentI[] = [];
  users: UserI[] = [];
  shifts: ShiftI[] = [];

  // Filtered Data
  filteredSubDepartments: SubDepartmentI[] = [];
  filteredUsers: UserI[] = [];
  filteredShifts: ShiftI[] = [];

  // Filters & Pagination
  filters: ScheduleFilters = {
    startDate: '',
    endDate: '',
    departmentId: '',
    subDepartmentId: '',
    userId: '',
    shiftId: '',
    page: 1,
    limit: PAGINATION_CONFIG.DEFAULT_LIMIT
  };

  pagination = {
    total: 0,
    totalFiltered: 0,
    page: 1,
    limit: PAGINATION_CONFIG.DEFAULT_LIMIT,
    totalPages: 0
  };

  // Create Schedule
  newSchedule: CreateScheduleRequest = {
    date: '',
    departmentId: '',
    userId: '',
    shiftId: '',
    subDepartmentId: ''
  };

  // Bulk Create
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

  // UI State
  selectedDates: string[] = [];
  dateRange = { start: '', end: '' };
  editingScheduleId: string | null = null;
  loading = false;
  dataLoading = false;
  error = '';

  // Form Validation
  formErrors = {
    date: '',
    departmentId: '',
    userId: '',
    shiftId: '',
    subDepartmentId: ''
  };

  bulkFormErrors = {
    dates: '',
    userIds: '',
    departmentId: '',
    shiftId: '',
    subDepartmentId: ''
  };

  // User Context
  currentUser: UserI | null = null;
  userDepartmentId: string | null = null;
  isAdminUser = false;
  isManagerUser = false;

  private destroy$ = new Subject<void>();

  constructor(
    private schedulesService: SchedulesService,
    private sharedService: SharedService,
    private authService: AuthService,
    private toastr: ToastrService
  ) { }

  ngOnInit(): void {
    console.log('🔵 Schedules Component Initialized');
    this.initializeUserData();
    this.loadAllData();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ==================== INITIALIZATION METHODS ====================

  private initializeUserData(): void {
    this.currentUser = this.authService.getCurrentUser();

    if (this.currentUser) {
      this.isAdminUser = this.currentUser.role === 'admin';
      this.isManagerUser = this.currentUser.role === 'manager';
      this.userDepartmentId = this.currentUser.departmentId || null;

      console.log('👤 Current User:', {
        role: this.currentUser.role,
        departmentId: this.userDepartmentId,
        isAdmin: this.isAdminUser,
        isManager: this.isManagerUser
      });

      this.initializeRoleBasedDefaults();
    }
  }

  private initializeRoleBasedDefaults(): void {
    if (this.isManagerUser && this.userDepartmentId) {
      this.filters.departmentId = this.userDepartmentId;
      this.newSchedule.departmentId = this.userDepartmentId;
      this.bulkCreateData.departmentId = this.userDepartmentId;
    } else if (!this.isAdminUser && this.userDepartmentId) {
      this.filters.departmentId = this.userDepartmentId;
      this.newSchedule.departmentId = this.userDepartmentId;
      this.bulkCreateData.departmentId = this.userDepartmentId;
    }
  }

  // ==================== DATA LOADING METHODS ====================

  private loadAllData(): void {
    this.dataLoading = true;
    console.log('🔄 Loading all data...');

    this.sharedService.loadAll();
    this.loadDepartmentsBasedOnRole();
    this.loadSubDepartments();
    this.loadUsers();
    this.loadShifts();
    this.loadSchedules();
  }

  private loadDepartmentsBasedOnRole(): void {
    if (this.isAdminUser) {
      this.sharedService.getDepartments()
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (depts) => {
            this.departments = depts;
            console.log('📊 All departments loaded for admin:', depts.length);
            this.checkDataStatus();
          },
          error: (err) => this.handleDataLoadError('departments', err)
        });
    } else if (this.userDepartmentId) {
      this.sharedService.getDepartments()
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (depts) => {
            const userDept = depts.find(dept => dept._id === this.userDepartmentId);
            this.departments = userDept ? [userDept] : [];
            console.log('📊 User department loaded:', this.departments);
            this.checkDataStatus();
          },
          error: (err) => this.handleDataLoadError('departments', err)
        });
    } else {
      this.departments = [];
      this.dataLoading = false;
    }
  }

  private loadSubDepartments(): void {
    this.sharedService.getSubDepartments()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (subDepts) => {
          this.subDepartments = subDepts;
          console.log('📁 SubDepartments loaded:', subDepts.length);
          this.filterDataBasedOnRole();
          this.checkDataStatus();
        },
        error: (err) => this.handleDataLoadError('subdepartments', err)
      });
  }

  private loadUsers(): void {
    this.sharedService.getUsers()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (users) => {
          this.users = this.filterUsersByRole(users);
          console.log('👥 Users loaded after filtering:', this.users.length);
          this.filterDataBasedOnRole();
          this.checkDataStatus();
        },
        error: (err) => this.handleDataLoadError('users', err)
      });
  }

  private loadShifts(): void {
    this.schedulesService.getShiftsForSchedules()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.shifts = response.data || [];
          this.filterDataBasedOnRole();
          console.log('✅ Shifts loaded:', this.shifts.length);
        },
        error: (err) => this.handleError('Failed to load shifts', err)
      });
  }

  loadSchedules(): void {
    this.loading = true;
    this.error = '';

    this.schedulesService.getSchedules(this.filters)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => this.handleSchedulesResponse(response),
        error: (err) => this.handleSchedulesError(err)
      });
  }

  private handleSchedulesResponse(response: any): void {
    this.schedules = response.data || [];
    this.updatePagination(response);
    this.loading = false;
    console.log('✅ Schedules loaded successfully:', this.schedules.length);
  }

  private handleSchedulesError(err: any): void {
    console.error('❌ Error loading schedules:', err);
    this.handleError('Failed to load schedules', err);
    this.loading = false;
  }

  // ==================== FILTERING METHODS ====================

  private filterUsersByRole(allUsers: UserI[]): UserI[] {
    if (this.isAdminUser) {
      return allUsers;
    } else if (this.isManagerUser && this.userDepartmentId) {
      return allUsers.filter(user =>
        user.departmentId === this.userDepartmentId
      );
    } else if (this.userDepartmentId) {
      return allUsers.filter(user =>
        user.departmentId === this.userDepartmentId
      );
    } else {
      return [];
    }
  }

  private filterDataBasedOnRole(): void {
    if (this.isManagerUser && this.userDepartmentId) {
      this.applyManagerFilters();
    } else if (this.isAdminUser) {
      this.applyAdminFilters();
    } else if (this.userDepartmentId) {
      this.applyUserFilters();
    } else {
      this.applyNoAccessFilters();
    }
  }

  private applyManagerFilters(): void {
    if (!this.userDepartmentId) return;

    this.filteredSubDepartments = this.subDepartments.filter(
      sub => this.getSubDepartmentDepartmentId(sub) === this.userDepartmentId
    );

    this.filteredUsers = [...this.users];

    this.filteredShifts = this.shifts.filter(shift =>
      shift.departmentId === this.userDepartmentId
    );

    console.log('👨‍💼 Manager filters applied:', {
      departmentId: this.userDepartmentId,
      subDepartments: this.filteredSubDepartments.length,
      users: this.filteredUsers.length,
      shifts: this.filteredShifts.length
    });
  }

  private applyAdminFilters(): void {
    this.filteredSubDepartments = [...this.subDepartments];
    this.filteredUsers = [...this.users];
    this.filteredShifts = [...this.shifts];
  }

  private applyUserFilters(): void {
    if (!this.userDepartmentId) return;

    this.filteredSubDepartments = this.subDepartments.filter(
      sub => this.getSubDepartmentDepartmentId(sub) === this.userDepartmentId
    );

    this.filteredUsers = [...this.users];

    this.filteredShifts = this.shifts.filter(shift =>
      shift.departmentId === this.userDepartmentId
    );

    console.log('👤 User filters applied:', {
      departmentId: this.userDepartmentId,
      subDepartments: this.filteredSubDepartments.length,
      users: this.filteredUsers.length,
      shifts: this.filteredShifts.length
    });
  }

  private applyNoAccessFilters(): void {
    this.filteredSubDepartments = [];
    this.filteredUsers = [];
    this.filteredShifts = [];
  }

  onDepartmentFilterChange(): void {
    if (this.filters.departmentId) {
      this.applyDepartmentFilter(this.filters.departmentId);
    } else {
      this.filterDataBasedOnRole();
    }
    this.applyFilters();
  }

  applyDepartmentFilter(departmentId: string): void {
    this.filteredSubDepartments = this.subDepartments.filter(
      sub => {
        const subDeptId = typeof sub.departmentId === 'string'
          ? sub.departmentId
          : sub.department?._id;
        return subDeptId === departmentId;
      }
    );

    this.filteredUsers = this.users.filter(
      user => user.departmentId === departmentId
    );

    this.filterShiftsByDepartment(departmentId);

    this.filters.subDepartmentId = '';
    this.filters.userId = '';
    this.filters.shiftId = '';
  }

  filterShiftsByDepartment(departmentId: string): void {
    if (departmentId) {
      this.filteredShifts = this.shifts.filter(shift =>
        shift.departmentId === departmentId
      );
    } else {
      this.filterDataBasedOnRole();
    }

    console.log('🔍 Shifts filtered for department:', {
      departmentId: departmentId,
      filteredCount: this.filteredShifts.length,
      userType: this.isAdminUser ? 'Admin' : (this.isManagerUser ? 'Manager' : 'User')
    });
  }

  // ==================== MODAL METHODS ====================

  openCreateModal(): void {
    this.showCreateModal = true;
    this.createMode = 'single';
    this.editingScheduleId = null;
    this.resetNewScheduleForm();
    this.clearBulkFormErrors();

    // ✅ نطبق الفلترة الأولية بناءً على صلاحية المستخدم
    this.applyModalInitialFilters();
  }

  closeModal(): void {
    this.showCreateModal = false;
    this.createMode = 'single';
    this.bulkCreateStep = 1;
    this.editingScheduleId = null;
    this.resetNewScheduleForm();
    this.clearBulkFormErrors();
  }

  private applyModalInitialFilters(): void {
    if (this.isManagerUser && this.userDepartmentId) {
      // Manager - نعرض بيانات قسمه فقط
      this.newSchedule.departmentId = this.userDepartmentId;
      this.applyModalDepartmentFilter(this.userDepartmentId);
    } else if (!this.isAdminUser && this.userDepartmentId) {
      // User عادي - نعرض بيانات قسمه فقط
      this.newSchedule.departmentId = this.userDepartmentId;
      this.applyModalDepartmentFilter(this.userDepartmentId);
    } else if (this.isAdminUser) {
      // Admin - نعرض كل البيانات بدون فلترة مبدئية
      this.filteredSubDepartments = [...this.subDepartments];
      this.filteredUsers = [...this.users];
      this.filteredShifts = [...this.shifts];
    }

    console.log('📋 Modal initial filters applied:', {
      userType: this.isAdminUser ? 'Admin' : (this.isManagerUser ? 'Manager' : 'User'),
      departmentId: this.userDepartmentId,
      users: this.filteredUsers.length,
      shifts: this.filteredShifts.length,
      subDepartments: this.filteredSubDepartments.length
    });
  }

  onModalDepartmentChange(): void {
    console.log('🔄 Modal department changed to:', this.newSchedule.departmentId);

    if (this.newSchedule.departmentId) {
      this.applyModalDepartmentFilter(this.newSchedule.departmentId);
    } else {
      this.applyModalInitialFilters();
    }

    this.newSchedule.subDepartmentId = '';
    this.newSchedule.userId = '';
    this.newSchedule.shiftId = '';
    this.clearFormErrors();
  }

  applyModalDepartmentFilter(departmentId: string): void {
    console.log('🎯 Applying modal filter for department:', departmentId);

    if (!this.canAccessDepartment(departmentId)) {
      this.toastr.warning('You do not have access to this department');
      this.newSchedule.departmentId = '';
      this.applyModalInitialFilters();
      return;
    }



    // ✅ فلترة الأقسام الفرعية بناءً على القسم المختار
    this.filteredSubDepartments = this.subDepartments.filter(
      sub => {
        const subDeptId = typeof sub.departmentId === 'string'
          ? sub.departmentId
          : sub.department?._id;
        return subDeptId === departmentId;
      }
    );

    // ✅ فلترة المستخدمين بناءً على القسم المختار
    this.filteredUsers = this.users.filter(
      user => user.departmentId === departmentId && this.canAccessUser(user)
    );

    // ✅ فلترة الشفتات بناءً على القسم المختار - هذا هو الجزء المهم
    this.filteredShifts = this.shifts.filter(shift =>
    shift.departmentId === departmentId
    );

    console.log('📋 Modal department filter applied:', {
      departmentId: departmentId,
      users: this.filteredUsers.length,
      shifts: this.filteredShifts.length,
      subDepartments: this.filteredSubDepartments.length
    });
  }

  // ==================== BULK CREATE METHODS ====================

  setCreateMode(mode: 'single' | 'bulk'): void {
    this.createMode = mode;
    if (mode === 'bulk') {
      this.bulkCreateStep = 1;
      this.bulkCreateData = {
        dates: [],
        userIds: [],
        departmentId: this.getDefaultDepartmentForBulk(),
        shiftId: '',
        subDepartmentId: ''
      };
      this.selectedDates = [];
      this.dateRange = { start: '', end: '' };

      // ✅ تطبيق الفلترة التلقائية في وضع البلك
      this.applyBulkInitialFilters();
    }
  }

  private getDefaultDepartmentForBulk(): string {
    if (this.isManagerUser && this.userDepartmentId) {
      return this.userDepartmentId;
    } else if (!this.isAdminUser && this.userDepartmentId) {
      return this.userDepartmentId;
    }
    return '';
  }

  private applyBulkInitialFilters(): void {
    console.log('🔄 Applying bulk initial filters:', this.bulkCreateData.departmentId);

    if (this.bulkCreateData.departmentId) {
      this.onBulkDepartmentChange();
    } else {
      this.filteredUsers = this.getAccessibleUsers();
      this.filteredShifts = this.getAccessibleShifts();
    }
  }

  onBulkDepartmentChange(): void {
    console.log('🔄 Bulk department changed to:', this.bulkCreateData.departmentId);

    if (this.bulkCreateData.departmentId) {
      if (!this.canAccessDepartment(this.bulkCreateData.departmentId)) {
        this.toastr.warning('You do not have access to this department');
        this.bulkCreateData.departmentId = '';
        this.applyBulkInitialFilters();
        return;
      }

      // ✅ فلترة المستخدمين بناءً على القسم المختار
      this.filteredUsers = this.users.filter(
        user => user.departmentId === this.bulkCreateData.departmentId
      );

      // ✅ فلترة الشفتات بناءً على القسم المختار
      this.filteredShifts = this.shifts.filter(shift =>
      shift.departmentId === this.bulkCreateData.departmentId
    );
      console.log('📦 Bulk modal department filter applied:', {
        departmentId: this.bulkCreateData.departmentId,
        users: this.filteredUsers.length,
        shifts: this.filteredShifts.length
      });
    } else {
      this.filterDataBasedOnRole();
    }

    this.bulkCreateData.userIds = [];
    this.bulkCreateData.subDepartmentId = '';
    this.bulkCreateData.shiftId = '';
    this.clearBulkFormErrors();
  }

  // ==================== BULK CREATE STEP METHODS ====================

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
               !!this.bulkCreateData.shiftId ;
      default:
        return true;
    }
  }

  // ==================== DATE RANGE METHODS ====================

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

  onDateRangeChange(): void {
    if (this.dateRange.start && this.dateRange.end) {
      this.generateDateRange();
    }
  }

  toggleDate(date: string): void {
    const index = this.bulkCreateData.dates.indexOf(date);
    if (index > -1) {
      this.bulkCreateData.dates.splice(index, 1);
    } else {
      this.bulkCreateData.dates.push(date);
    }
  }

  toggleUser(userId: string): void {
    const index = this.bulkCreateData.userIds.indexOf(userId);
    if (index > -1) {
      this.bulkCreateData.userIds.splice(index, 1);
    } else {
      this.bulkCreateData.userIds.push(userId);
    }
  }

  toggleAllUsers(): void {
    if (this.bulkCreateData.userIds.length === this.filteredUsers.length) {
      this.bulkCreateData.userIds = [];
    } else {
      this.bulkCreateData.userIds = this.filteredUsers.map(user => user._id!);
    }
  }

  toggleAllDates(): void {
    if (this.bulkCreateData.dates.length === this.selectedDates.length) {
      this.bulkCreateData.dates = [];
    } else {
      this.bulkCreateData.dates = [...this.selectedDates];
    }
  }

  // ==================== CREATE SCHEDULE METHODS ====================

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

  if (!this.validateUserAccess(this.newSchedule)) {
    return;
  }

  this.loading = true;

  const payload: any = {
    date: this.newSchedule.date,
    departmentId: this.newSchedule.departmentId,
    userId: this.newSchedule.userId,
    shiftId: this.newSchedule.shiftId
  };

  if (this.newSchedule.subDepartmentId && this.newSchedule.subDepartmentId.trim() !== '') {
    payload.subDepartmentId = this.newSchedule.subDepartmentId;
  }

  console.log('➕ Creating/Updating schedule with payload:', payload);

  let obs$;

  if (this.editingScheduleId) {
    obs$ = this.schedulesService.updateSchedule(this.editingScheduleId, payload);
  } else {
    obs$ = this.schedulesService.createSchedule(payload);
  }

  obs$.subscribe({
    next: (response) => {
      const index = this.schedules.findIndex(s => s._id === this.editingScheduleId);
      if (index !== -1) {
        this.schedules[index] = { ...this.schedules[index], ...response.data };
      }

      this.closeModal();
      this.loading = false;
      this.loadSchedules();
      this.toastr.success('Schedule updated successfully');
    },
    error: (err) => {
      this.handleError('Failed to update schedule', err);
      this.loading = false;
    }
  });
}

  createBulkSchedules(): void {
  if (!this.validateBulkCreate()) {
    this.error = 'Please fix the validation errors before submitting';
    return;
  }

  this.loading = true;

  const payload: any = {
    dates: this.bulkCreateData.dates,
    userIds: this.bulkCreateData.userIds,
    departmentId: this.bulkCreateData.departmentId,
    shiftId: this.bulkCreateData.shiftId
  };

  if (this.bulkCreateData.subDepartmentId && this.bulkCreateData.subDepartmentId.trim() !== '') {
    payload.subDepartmentId = this.bulkCreateData.subDepartmentId;
  }

  console.log('➕ Creating bulk schedules with payload:', payload);

  this.schedulesService.createMultipleSchedules(payload)
    .pipe(takeUntil(this.destroy$))
    .subscribe({
      next: (response) => {
        this.closeModal();
        this.loading = false;
        this.loadSchedules();
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

  // ==================== UPDATE SCHEDULE METHOD ====================

  updateSchedule(schedule: ScheduleI): void {
    if (!schedule._id) {
      this.error = 'Invalid schedule data';
      return;
    }

    this.editingScheduleId = schedule._id;

    this.newSchedule = {
      date: schedule.date,
      departmentId: schedule.departmentId || '',
      userId: schedule.userId || '',
      shiftId: schedule.shiftId || '',
      subDepartmentId: schedule.subDepartmentId || ''
    };

    console.log('✏️ Updating schedule with department:', this.newSchedule.departmentId);

    // ✅ نطبق الفلترة بناءً على الـ department اللي جاي من الجدول
    if (this.newSchedule.departmentId) {
      this.applyModalDepartmentFilter(this.newSchedule.departmentId);
    } else {
      this.applyModalInitialFilters();
    }

    this.showCreateModal = true;
    this.createMode = 'single';
  }

  // ==================== DELETE SCHEDULE METHOD ====================

  deleteSchedule(id: string): void {
    if (!id) {
      this.error = 'Invalid schedule ID';
      return;
    }

    if (confirm('Are you sure you want to delete this schedule?')) {
      this.loading = true;
      this.schedulesService.deleteSchedule(id)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.schedules = this.schedules.filter(s => s._id !== id);
            this.loading = false;
            this.loadSchedules();
            this.toastr.success('Schedule deleted successfully');
          },
          error: (err) => {
            this.handleError('Failed to delete schedule', err);
            this.loading = false;
          }
        });
    }
  }

  // ==================== VALIDATION METHODS ====================

  validateSchedule(schedule: CreateScheduleRequest): boolean {
    this.clearFormErrors();
    let isValid = true;

    if (!schedule.date) {
      this.formErrors.date = VALIDATION_MESSAGES.date.required;
      isValid = false;
    } else {
      const selectedDate = new Date(schedule.date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (selectedDate < today) {
        this.formErrors.date = VALIDATION_MESSAGES.date.future;
        isValid = false;
      }
    }

    if (!schedule.departmentId) {
      this.formErrors.departmentId = VALIDATION_MESSAGES.departmentId.required;
      isValid = false;
    }

    if (!schedule.userId) {
      this.formErrors.userId = VALIDATION_MESSAGES.userId.required;
      isValid = false;
    }

    if (!schedule.shiftId) {
      this.formErrors.shiftId = VALIDATION_MESSAGES.shiftId.required;
      isValid = false;
    }

    return isValid;
  }

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

    return isValid;
  }

  // ==================== SECURITY METHODS ====================

  private validateUserAccess(schedule: CreateScheduleRequest): boolean {
    if (this.isAdminUser) return true;

    if (schedule.departmentId && !this.canAccessDepartment(schedule.departmentId)) {
      this.error = 'You do not have access to this department';
      return false;
    }

    if (schedule.userId) {
      const selectedUser = this.users.find(u => u._id === schedule.userId);
      if (selectedUser && !this.canAccessUser(selectedUser)) {
        this.error = 'You do not have access to this user';
        return false;
      }
    }

    return true;
  }

  canAccessDepartment(departmentId: string): boolean {
    if (this.isAdminUser) return true;
    if (this.isManagerUser && this.userDepartmentId) {
      return departmentId === this.userDepartmentId;
    }
    if (this.userDepartmentId) {
      return departmentId === this.userDepartmentId;
    }
    return false;
  }

  canAccessUser(user: UserI): boolean {
    if (this.isAdminUser) return true;
    if (this.isManagerUser && this.userDepartmentId) {
      return user.departmentId === this.userDepartmentId;
    }
    if (this.userDepartmentId) {
      return user.departmentId === this.userDepartmentId;
    }
    return false;
  }

  // ==================== FILTER METHODS ====================

  applyFilters(): void {
    this.filters.page = 1;
    this.loadSchedules();
  }

  resetFilters(): void {
    this.filters = {
      startDate: '',
      endDate: '',
      departmentId: this.getDefaultDepartmentFilter(),
      subDepartmentId: '',
      userId: '',
      shiftId: '',
      page: 1,
      limit: PAGINATION_CONFIG.DEFAULT_LIMIT
    };
    this.filterDataBasedOnRole();
    this.loadSchedules();
  }

  private getDefaultDepartmentFilter(): string {
    if (this.isManagerUser && this.userDepartmentId) {
      return this.userDepartmentId;
    } else if (!this.isAdminUser && this.userDepartmentId) {
      return this.userDepartmentId;
    }
    return '';
  }

  // ==================== DISPLAY METHODS ====================

  getDepartmentDisplay(schedule: ScheduleI): string {
    if (!schedule) return 'No Data';

    const departmentId = schedule.departmentId;

    if ((schedule as any).department) {
      const dept = (schedule as any).department;
      if (typeof dept === 'string' && dept !== 'null') return dept;
      if (dept?.name && dept.name !== 'null') return dept.name;
    }

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

    if ((schedule as any).subDepartment) {
      const subDept = (schedule as any).subDepartment;
      if (typeof subDept === 'string' && subDept !== 'null') return subDept;
      if (subDept?.name && subDept.name !== 'null') return subDept.name;
    }

    if (subDepartmentId && subDepartmentId !== 'null') {
      const subDept = this.subDepartments.find(s => s._id === subDepartmentId);
      return subDept?.name || `Sub-Dept (${subDepartmentId.substring(0, 6)}...)`;
    }

    return 'No Sub-Department';
  }

  getUserDisplay(schedule: ScheduleI): string {
    if (!schedule) return 'No Data';

    const userId = schedule.userId;

    if ((schedule as any).user) {
      const user = (schedule as any).user;
      if (typeof user === 'string' && user !== 'null') return user;
      if (user?.fullName && user.fullName !== 'null') return user.fullName;
      if (user?.name && user.name !== 'null') return user.name;
    }

    if (userId && userId !== 'null') {
      const user = this.users.find(u => u._id === userId);
      if (user) {
        if (this.canAccessUser(user)) {
          return user.fullName || `User (${userId.substring(0, 6)}...)`;
        } else {
          return 'Access Denied';
        }
      }
      return `User (${userId.substring(0, 6)}...)`;
    }

    return 'No User';
  }

  getShiftDisplay(schedule: ScheduleI): string {
    if (!schedule) return 'No Data';

    const shiftId = schedule.shiftId;

    if ((schedule as any).shift) {
      const shift = (schedule as any).shift;
      if (typeof shift === 'string' && shift !== 'null') return shift;
      if (shift?.shiftName && shift.shiftName !== 'null') return shift.shiftName;
      if (shift?.name && shift.name !== 'null') return shift.name;
    }

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

    if ((schedule as any).shift) {
      const shift = (schedule as any).shift;
      if (shift?.shiftType && shift.shiftType !== 'null') return shift.shiftType;
    }

    if (shiftId && shiftId !== 'null') {
      const shift = this.shifts.find(s => s._id === shiftId);
      if (shift && shift.shiftType !== 'null') return shift.shiftType || '';
    }

    return '';
  }

  getShiftTimeDisplay(schedule: ScheduleI): string {
    if (!schedule) return '';

    const shiftId = schedule.shiftId;

    if ((schedule as any).shift) {
      const shift = (schedule as any).shift;
      if (shift?.startTimeFormatted && shift?.endTimeFormatted) {
        return `${shift.startTimeFormatted} - ${shift.endTimeFormatted}`;
      }
    }

    if (shiftId && shiftId !== 'null') {
      const shift = this.shifts.find(s => s._id === shiftId);
      if (shift) {
        return `${shift.startTimeFormatted || shift.startTime} - ${shift.endTimeFormatted || shift.endTime}`;
      }
    }

    return '';
  }

  getSelectedShiftName(): string {
    if (!this.bulkCreateData.shiftId) return 'Not selected';

    const shift = this.shifts.find(s => s._id === this.bulkCreateData.shiftId);
    if (shift) {
      return `${shift.shiftName} (${shift.shiftType})`;
    }

    return 'Unknown Shift';
  }

  // ==================== UTILITY METHODS ====================

  private getSubDepartmentDepartmentId(sub: SubDepartmentI): string | undefined {
    return typeof sub.departmentId === 'string'
      ? sub.departmentId
      : sub.department?._id;
  }

  private getAccessibleUsers(): UserI[] {
    if (this.isAdminUser) return [...this.users];
    if (this.userDepartmentId) {
      return this.users.filter(user => user.departmentId === this.userDepartmentId);
    }
    return [];
  }

  private getAccessibleShifts(): ShiftI[] {
    if (this.isAdminUser) return [...this.shifts];
    if (this.userDepartmentId) {
      return this.shifts.filter(shift => shift.departmentId === this.userDepartmentId);
    }
    return [];
  }

  isValidSchedule(schedule: CreateScheduleRequest): boolean {
    return !!schedule.date &&
           !!schedule.departmentId &&
           !!schedule.userId &&
           !!schedule.shiftId ;
  }

  isBulkFormValid(): boolean {
    return this.bulkCreateData.dates.length > 0 &&
           this.bulkCreateData.userIds.length > 0 &&
           !!this.bulkCreateData.departmentId &&
           !!this.bulkCreateData.shiftId ;

  }

  refreshData(): void {
    console.log('🔄 Manually refreshing data...');
    this.initializeUserData();
    this.sharedService.refetchAll();
    this.loadAllData();
  }

  // ==================== PAGINATION METHODS ====================

  goToPage(page: number): void {
    if (page >= 1 && page <= this.pagination.totalPages) {
      this.filters.page = page;
      this.loadSchedules();
    }
  }

  getPageNumbers(): number[] {
    const totalPages = this.pagination.totalPages;
    const currentPage = this.pagination.page;

    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    const pages: number[] = [];

    pages.push(1);

    let start = Math.max(2, currentPage - 1);
    let end = Math.min(totalPages - 1, currentPage + 1);

    if (start > 2) {
      pages.push(-1);
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    if (end < totalPages - 1) {
      pages.push(-1);
    }

    if (totalPages > 1) {
      pages.push(totalPages);
    }

    return pages;
  }

  validatePagination(): void {
    if (this.pagination.page > this.pagination.totalPages && this.pagination.totalPages > 0) {
      this.filters.page = this.pagination.totalPages;
      this.loadSchedules();
    }
  }

  private updatePagination(response: any): void {
    this.pagination = {
      total: response.total || 0,
      totalFiltered: response.totalFiltered || 0,
      page: response.page || 1,
      limit: response.limit || PAGINATION_CONFIG.DEFAULT_LIMIT,
      totalPages: Math.ceil((response.total || 0) / (response.limit || PAGINATION_CONFIG.DEFAULT_LIMIT))
    };
  }

  // ==================== FORM METHODS ====================

  private clearFormErrors(): void {
    this.formErrors = {
      date: '',
      departmentId: '',
      userId: '',
      shiftId: '',
      subDepartmentId: ''
    };
  }

  private clearBulkFormErrors(): void {
    this.bulkFormErrors = {
      dates: '',
      userIds: '',
      departmentId: '',
      shiftId: '',
      subDepartmentId: ''
    };
  }

  resetNewScheduleForm(): void {
    this.newSchedule = {
      date: '',
      departmentId: this.getDefaultDepartmentFilter(),
      userId: '',
      shiftId: '',
      subDepartmentId: ''
    };
    this.error = '';
    this.clearFormErrors();
    this.filterDataBasedOnRole();
  }

  // ==================== DATA STATUS METHODS ====================

  checkDataStatus(): void {
    if (
      this.departments.length > 0 &&
      this.subDepartments.length > 0 &&
      this.users.length > 0
    ) {
      this.dataLoading = false;
    }
  }

  private handleDataLoadError(dataType: string, err: any): void {
    console.error(`❌ Error loading ${dataType}:`, err);
    this.handleError(`Failed to load ${dataType}`, err);
    this.dataLoading = false;
  }

  // ==================== ERROR HANDLING ====================

  private handleError(defaultMessage: string, error: any): void {
    console.error('❌ Error:', error);

    if (error.error && error.error.message) {
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

  // ==================== UTILITY METHODS ====================

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

  getDepartmentName(departmentId: string): string {
    if (!departmentId) return 'No Department';

    const department = this.departments.find(dept => dept._id === departmentId);
    return department?.name || `Department (${departmentId.substring(0, 6)}...)`;
  }

  isUserSelected(userId: string): boolean {
    return this.bulkCreateData.userIds.includes(userId);
  }

  isDateSelected(date: string): boolean {
    return this.bulkCreateData.dates.includes(date);
  }

  getSelectedUsersCount(): number {
    return this.bulkCreateData.userIds.length;
  }

  getSelectedDatesCount(): number {
    return this.bulkCreateData.dates.length;
  }
}
