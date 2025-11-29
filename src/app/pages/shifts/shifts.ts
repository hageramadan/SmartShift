// shifts.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { CrudService } from '../../services/crud.service';
import { SharedService } from '../../services/shared.service';
import { SubDepartmentI } from '../../models/sub-department-i';
import { DepartmentI } from '../../models/department-i';
import { LocationI } from '../../models/location-i';

interface Shift {
  _id?: string;
  id?: string;
  shiftName?: string;
  shiftType?: string;
  startTime?: number;
  endTime?: number;
  startTimeFormatted?: string;
  endTimeFormatted?: string;
  departmentId?: string;
  subDepartmentId?: string;
  department?: DepartmentI | null;
  subDepartment?: SubDepartmentI | null;
  location?: LocationI | null;
  durationMinutes?: number;
  isOvernight?: boolean;
  durationFormatted?: string;
}

interface Filters {
  shiftName: string;
  shiftType: string;
  departmentId: string;
  subDepartmentId: string;
}

interface ValidationErrors {
  shiftName?: string;
  shiftType?: string;
  startTime?: string;
  endTime?: string;
  departmentId?: string;
  general?: string;
}

@Component({
  selector: 'app-shifts',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './shifts.html',
  styleUrls: ['./shifts.css'],
})
export class Shifts implements OnInit {
  shifts: Shift[] = [];
  filteredShifts: Shift[] = [];
  paginatedShifts: Shift[] = [];
  departments: DepartmentI[] = [];
  subDepartments: SubDepartmentI[] = [];
  locations: LocationI[] = [];

  isModalOpen = false;
  isEditing = false;
  showDeleteConfirm = false;
  shiftToDeleteId: string | null = null;
  submitted = false;

  // Validation errors
  validationErrors: ValidationErrors = {};

  // Pagination
  currentPage = 1;
  pageSize = 10;
  totalPages = 1;
  totalItems = 0;

  // Filters
  filters: Filters = {
    shiftName: '',
    shiftType: '',
    departmentId: '',
    subDepartmentId: ''
  };

  // Loading states
  isLoading = false;
  isDataLoading = true;

  newShift: Partial<Shift> = {
    shiftType: '',
    shiftName: '',
    startTimeFormatted: '',
    endTimeFormatted: '',
    departmentId: '',
    subDepartmentId: ''
  };

  // Shift types for dropdown with common values
  shiftTypes: string[] = ['Morning', 'Evening', 'Night', 'Rotating', 'On-Call', 'Flexible', 'Holiday', 'Emergency'];
  customShiftType: string = '';

  constructor(
    private toastr: ToastrService,
    private crud: CrudService,
    private sharedSrv: SharedService
  ) {}

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.isDataLoading = true;
    this.sharedSrv.loadAll();

    this.sharedSrv.getDepartments().subscribe((depts) => {
      this.departments = depts;
      this.checkDataLoaded();
    });

    this.sharedSrv.getSubDepartments().subscribe((subDepts) => {
      this.subDepartments = subDepts;
      this.checkDataLoaded();
    });

    this.sharedSrv.getLocations().subscribe((locs) => {
      this.locations = locs;
      this.checkDataLoaded();
    });

    this.fetchShifts();
  }

  private checkDataLoaded() {
    if (this.departments.length > 0 && this.subDepartments.length > 0 && this.locations.length > 0) {
      this.isDataLoading = false;
    }
  }

  fetchShifts() {
    this.isDataLoading = true;
    this.crud.getAll<Shift>('shifts').subscribe({
      next: (res) => {
        this.shifts = res.data ?? [];
        // حساب المدة بشكل صحيح للبيانات المحملة
        this.shifts.forEach(shift => {
          if (shift.startTimeFormatted && shift.endTimeFormatted) {
            shift.durationFormatted = this.calculateDuration(
              shift.startTimeFormatted, 
              shift.endTimeFormatted
            );
          }
        });
        this.totalItems = res.total || this.shifts.length;
        this.applyFilters();
        this.isDataLoading = false;
      },
      error: (err) => {
        this.toastr.error('Failed to fetch shifts');
        this.isDataLoading = false;
        console.error('Error fetching shifts:', err);
      }
    });
  }

  // Filter Methods
  applyFilters() {
    this.currentPage = 1;
    this.filteredShifts = this.shifts.filter(shift => {
      const nameMatch = !this.filters.shiftName || 
        (shift.shiftName && shift.shiftName.toLowerCase().includes(this.filters.shiftName.toLowerCase()));
      
      const typeMatch = !this.filters.shiftType || 
        (shift.shiftType && shift.shiftType.toLowerCase().includes(this.filters.shiftType.toLowerCase()));
      
      const departmentMatch = !this.filters.departmentId || 
        shift.departmentId === this.filters.departmentId;
      
      const subDepartmentMatch = !this.filters.subDepartmentId || 
        shift.subDepartmentId === this.filters.subDepartmentId;

      return nameMatch && typeMatch && departmentMatch && subDepartmentMatch;
    });
    
    this.totalItems = this.filteredShifts.length;
    this.updatePagination();
  }

  clearFilters() {
    this.filters = {
      shiftName: '',
      shiftType: '',
      departmentId: '',
      subDepartmentId: ''
    };
    this.applyFilters();
  }

  // Pagination Methods
  updatePagination() {
    this.totalPages = Math.ceil(this.filteredShifts.length / this.pageSize);
    const startIndex = (this.currentPage - 1) * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    this.paginatedShifts = this.filteredShifts.slice(startIndex, endIndex);
  }

  getPageNumbers(): number[] {
    const pages: number[] = [];
    const maxVisiblePages = 5;
    
    let startPage = Math.max(1, this.currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(this.totalPages, startPage + maxVisiblePages - 1);
    
    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }
    
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    
    return pages;
  }

  goToPage(page: number) {
    this.currentPage = page;
    this.updatePagination();
  }

  previousPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.updatePagination();
    }
  }

  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.updatePagination();
    }
  }

  // Math utility for template
  Math = Math;

  // Shift Type Methods
  onShiftTypeSelect(event: any) {
    const selectedValue = event.target.value;
    if (selectedValue === 'custom') {
      // إذا اختار "Other" نفتح حقل الإدخال
      this.newShift.shiftType = '';
      this.customShiftType = '';
    } else if (selectedValue) {
      this.newShift.shiftType = selectedValue;
      this.customShiftType = '';
    }
  }

  onCustomShiftTypeInput() {
    if (this.customShiftType.trim()) {
      this.newShift.shiftType = this.customShiftType;
    }
  }

  // Validation Methods
  private validateForm(): boolean {
    this.validationErrors = {};

    // Required field validation
    if (!this.newShift.shiftName?.trim()) {
      this.validationErrors.shiftName = 'Shift name is required';
    }

    if (!this.newShift.shiftType?.trim()) {
      this.validationErrors.shiftType = 'Shift type is required';
    }

    if (!this.newShift.startTimeFormatted) {
      this.validationErrors.startTime = 'Start time is required';
    }

    if (!this.newShift.endTimeFormatted) {
      this.validationErrors.endTime = 'End time is required';
    }

    if (!this.newShift.departmentId) {
      this.validationErrors.departmentId = 'Department is required';
    }

    // Time validation - دعم الشفتات الليلية
    if (this.newShift.startTimeFormatted && this.newShift.endTimeFormatted) {
      const startTime = this.timeToMinutes(this.newShift.startTimeFormatted);
      const endTime = this.timeToMinutes(this.newShift.endTimeFormatted);
      
      // إذا كان وقت النهاية أقل من وقت البداية، نفترض أنه شفت ليلي (يمتد إلى اليوم التالي)
      // في هذه الحالة، نسمح به ولكن نتحقق من أن المدة معقولة (أقل من 24 ساعة)
      if (endTime <= startTime) {
        // الشفت الليلي - نتحقق من أن المدة معقولة (أقل من 24 ساعة)
        const overnightDuration = (24 * 60 - startTime) + endTime; // المدة بالدقائق
        
        if (overnightDuration > 24 * 60) { // أكثر من 24 ساعة
          this.validationErrors.endTime = 'Shift duration cannot exceed 24 hours';
        } else if (overnightDuration <= 0) {
          this.validationErrors.endTime = 'Invalid shift duration';
        }
        // إذا كانت المدة معقولة، لا نضع أي خطأ - نسمح بالشفت الليلي
      } else {
        // الشفت العادي - نتحقق من أن وقت النهاية بعد البداية (وهو محقق بالفعل في هذه الحالة)
        const duration = endTime - startTime;
        if (duration > 24 * 60) { // أكثر من 24 ساعة
          this.validationErrors.endTime = 'Shift duration cannot exceed 24 hours';
        }
      }
    }

    return Object.keys(this.validationErrors).length === 0;
  }

  private clearValidationErrors() {
    this.validationErrors = {};
  }

  // Helper function to convert time string to minutes (for internal use only)
  private timeToMinutes(timeStr: string): number {
    if (!timeStr) return 0;
    
    // إذا كان الوقت بصيغة AM/PM
    if (timeStr.includes('AM') || timeStr.includes('PM')) {
      const [time, period] = timeStr.split(' ');
      const [hours, minutes] = time.split(':').map(Number);
      
      let totalMinutes = hours * 60 + (minutes || 0);
      
      if (period === 'PM' && hours !== 12) {
        totalMinutes += 12 * 60;
      } else if (period === 'AM' && hours === 12) {
        totalMinutes -= 12 * 60;
      }
      
      return totalMinutes;
    } else {
      // إذا كان الوقت بصيغة 24 ساعة (HH:MM)
      const [hours, minutes] = timeStr.split(':').map(Number);
      return hours * 60 + (minutes || 0);
    }
  }

  // Helper function to convert time input (HH:MM) to AM/PM format for API
  private formatTimeForAPI(timeStr: string): string {
    if (!timeStr) return '';
    
    const [hours, minutes] = timeStr.split(':').map(Number);
    const period = hours >= 12 ? 'PM' : 'AM';
    let displayHours = hours % 12;
    displayHours = displayHours === 0 ? 12 : displayHours;
    
    return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
  }

  // دالة مساعدة لحساب المدة بشكل صحيح
  private calculateDuration(startTime: string, endTime: string): string {
    if (!startTime || !endTime) return '';

    const startMinutes = this.timeToMinutes(startTime);
    const endMinutes = this.timeToMinutes(endTime);
    
    let durationMinutes: number;
    
    if (endMinutes <= startMinutes) {
      // شفت ليلي - يمتد إلى اليوم التالي
      durationMinutes = (24 * 60 - startMinutes) + endMinutes;
    } else {
      // شفت عادي
      durationMinutes = endMinutes - startMinutes;
    }
    
    const hours = Math.floor(durationMinutes / 60);
    const minutes = durationMinutes % 60;
    
    if (hours > 0 && minutes > 0) {
      return `${hours}h ${minutes}m`;
    } else if (hours > 0) {
      return `${hours}h`;
    } else {
      return `${minutes}m`;
    }
  }

  // CRUD Operations
  addShift() {
    this.isModalOpen = true;
    this.isEditing = false;
    this.submitted = false;
    this.clearValidationErrors();
    this.newShift = {
      shiftType: '',
      shiftName: '',
      startTimeFormatted: '',
      endTimeFormatted: '',
      departmentId: '',
      subDepartmentId: ''
    };
    this.customShiftType = '';
  }

  editShift(shift: Shift) {
    this.isModalOpen = true;
    this.isEditing = true;
    this.submitted = false;
    this.clearValidationErrors();

    // استخدام الوقت المنسق مباشرة من الـ API
    this.newShift = {
      _id: shift._id || shift.id,
      shiftName: shift.shiftName || '',
      shiftType: shift.shiftType || '',
      startTimeFormatted: shift.startTimeFormatted || '',
      endTimeFormatted: shift.endTimeFormatted || '',
      departmentId: shift.departmentId || '',
      subDepartmentId: shift.subDepartmentId || ''
    };

    // التحقق إذا كان نوع الشفت موجود في القائمة المحددة
    if (shift.shiftType && !this.shiftTypes.includes(shift.shiftType)) {
      this.customShiftType = shift.shiftType;
    } else {
      this.customShiftType = '';
    }
  }

  saveShift() {
    this.submitted = true;
    this.clearValidationErrors();

    // Frontend validation
    if (!this.validateForm()) {
      this.showValidationErrors();
      return;
    }

    // تجربة إرسال الوقت بتنسيق 24 ساعة أولاً (بدون تحويل)
    let startTimeToSend = this.newShift.startTimeFormatted || '';
    let endTimeToSend = this.newShift.endTimeFormatted || '';

    console.log('Original times - Start:', startTimeToSend, 'End:', endTimeToSend);

    // إعداد الـ payload بشكل صحيح
    const payload: any = {
      shiftName: (this.newShift.shiftName || '').trim(),
      shiftType: (this.newShift.shiftType || '').trim(),
      startTime: startTimeToSend, // إرسال كما هو (24 ساعة)
      endTime: endTimeToSend,     // إرسال كما هو (24 ساعة)
      departmentId: this.newShift.departmentId
    };

    // إضافة subDepartmentId إذا كان موجوداً
    if (this.newShift.subDepartmentId) {
      payload.subDepartmentId = this.newShift.subDepartmentId;
    }

    console.log('Saving shift payload:', payload);

    this.isLoading = true;

    let obs$;
    
    if (this.isEditing && this.newShift._id) {
      obs$ = this.crud.update<Shift>('shifts', this.newShift._id, payload);
    } else {
      obs$ = this.crud.create<Shift>('shifts', payload);
    }

    obs$.subscribe({
      next: (res: any) => {
        this.isLoading = false;
        console.log('API Response:', res);
        
        if (res && (res.data || res._id)) {
          this.handleSaveSuccess(res.data || res);
        } else {
          this.toastr.error('Unexpected response format from server');
        }
      },
      error: (err) => {
        this.isLoading = false;
        
        // إذا كان الخطأ متعلقاً بتنسيق الوقت، نجرب التنسيق الآخر
        if (err.status === 422 || err.status === 400) {
          const errorMessage = err.error?.message || err.error?.error || '';
          if (errorMessage.includes('time') || errorMessage.includes('Time') || errorMessage.includes('format')) {
            this.tryAlternativeTimeFormat(payload);
            return;
          }
        }
        
        this.handleApiError(err);
      }
    });
  }

  // دالة جديدة لمحاولة تنسيق وقت بديل
  private tryAlternativeTimeFormat(originalPayload: any) {
    console.log('Trying alternative time format...');
    
    // تحويل من 24 ساعة إلى 12 ساعة (AM/PM)
    const startTimeFormatted = this.formatTimeForAPI(originalPayload.startTime);
    const endTimeFormatted = this.formatTimeForAPI(originalPayload.endTime);

    const alternativePayload = {
      ...originalPayload,
      startTime: startTimeFormatted,
      endTime: endTimeFormatted
    };

    console.log('Alternative payload:', alternativePayload);

    this.isLoading = true;

    let obs$;
    
    if (this.isEditing && this.newShift._id) {
      obs$ = this.crud.update<Shift>('shifts', this.newShift._id, alternativePayload);
    } else {
      obs$ = this.crud.create<Shift>('shifts', alternativePayload);
    }

    obs$.subscribe({
      next: (res: any) => {
        this.isLoading = false;
        console.log('API Response with alternative format:', res);
        
        if (res && (res.data || res._id)) {
          this.handleSaveSuccess(res.data || res);
          this.toastr.success('Shift saved successfully with time format adjustment');
        } else {
          this.toastr.error('Unexpected response format from server');
        }
      },
      error: (err) => {
        this.isLoading = false;
        
        // إذا فشلت المحاولة الثانية، نعرض رسالة واضحة
        if (err.status === 422 || err.status === 400) {
          const errorMessage = err.error?.message || err.error?.error || '';
          if (errorMessage.includes('time') || errorMessage.includes('Time') || errorMessage.includes('format')) {
            this.toastr.error('Time format error. Please use HH:MM format (24-hour) or contact administrator.');
            return;
          }
        }
        
        this.handleApiError(err);
      }
    });
  }

  private showValidationErrors() {
    // عرض رسائل الخطأ للمستخدم
    if (this.validationErrors.shiftName) {
      this.toastr.error(this.validationErrors.shiftName);
    }
    if (this.validationErrors.shiftType) {
      this.toastr.error(this.validationErrors.shiftType);
    }
    if (this.validationErrors.startTime) {
      this.toastr.error(this.validationErrors.startTime);
    }
    if (this.validationErrors.endTime) {
      this.toastr.error(this.validationErrors.endTime);
    }
    if (this.validationErrors.departmentId) {
      this.toastr.error(this.validationErrors.departmentId);
    }
    if (this.validationErrors.general) {
      this.toastr.error(this.validationErrors.general);
    }
  }

  private handleApiError(err: any) {
    console.error('API Error Details:', err);
    
    let errorMessage = 'Operation failed';
    let errorDetails = '';

    // معالجة مختلف أشكال الأخطاء من الـ API
    if (err.status === 422) {
      errorMessage = 'Validation Error';
      
      if (err.error && err.error.details) {
        // إذا كان الخطأ يحتوي على details
        if (typeof err.error.details === 'string') {
          errorDetails = err.error.details;
        } else if (Array.isArray(err.error.details)) {
          errorDetails = err.error.details.join(', ');
        } else if (typeof err.error.details === 'object') {
          errorDetails = this.formatObjectErrors(err.error.details);
        }
      } else if (err.error && err.error.message) {
        errorDetails = err.error.message;
      } else if (err.error && err.error.error) {
        errorDetails = err.error.error;
      }
    } else if (err.status === 400) {
      errorMessage = 'Bad Request';
      if (err.error && err.error.message) {
        errorDetails = err.error.message;
      }
    } else if (err.status === 404) {
      errorMessage = 'Resource not found';
    } else if (err.status === 500) {
      errorMessage = 'Server error';
    }

    // عرض الرسالة النهائية
    const finalMessage = errorDetails ? `${errorMessage}: ${errorDetails}` : errorMessage;
    this.toastr.error(finalMessage);

    // تعيين أخطاء الـ validation في الحقول المناسبة
    if (err.status === 422 && err.error && err.error.details) {
      this.setValidationErrorsFromApi(err.error.details);
    }
  }

  private formatObjectErrors(errorObj: any): string {
    if (!errorObj) return '';
    
    const errors: string[] = [];
    
    for (const [field, messages] of Object.entries(errorObj)) {
      if (Array.isArray(messages)) {
        errors.push(`${field}: ${messages.join(', ')}`);
      } else {
        errors.push(`${field}: ${messages}`);
      }
    }
    
    return errors.join('; ');
  }

  private setValidationErrorsFromApi(errorDetails: any) {
    if (typeof errorDetails === 'object') {
      for (const [field, messages] of Object.entries(errorDetails)) {
        const fieldName = this.mapApiFieldToValidationField(field);
        if (Array.isArray(messages)) {
          this.validationErrors[fieldName] = messages[0];
        } else {
          this.validationErrors[fieldName] = messages as string;
        }
      }
    }
  }

  private mapApiFieldToValidationField(apiField: string): keyof ValidationErrors {
    // Mapping between API field names and our validation error field names
    const fieldMap: { [key: string]: keyof ValidationErrors } = {
      'shiftName': 'shiftName',
      'shiftType': 'shiftType',
      'startTime': 'startTime',
      'endTime': 'endTime',
      'departmentId': 'departmentId'
    };
    
    return fieldMap[apiField] || 'general';
  }

  private handleSaveSuccess(savedShift: any) {
    if (this.isEditing) {
      // تحديث العنصر الموجود
      const index = this.shifts.findIndex(s => s._id === savedShift._id || s.id === savedShift._id);
      if (index !== -1) {
        this.shifts[index] = { ...this.shifts[index], ...savedShift };
      }
      this.toastr.success('Shift updated successfully');
    } else {
      // إضافة عنصر جديد
      this.shifts = [savedShift, ...this.shifts];
      this.toastr.success('Shift created successfully');
      this.currentPage = 1; // الانتقال للصفحة الأولى
    }

    this.applyFilters();
    this.closeModal();
    this.refreshData(); // إعادة تحميل البيانات من السيرفر
  }

  // دالة مساعدة لإعادة تحميل البيانات من السيرفر
  refreshData() {
    this.sharedSrv.refetchAll();
    this.fetchShifts();
  }

  closeModal() {
    this.isModalOpen = false;
    this.newShift = {};
    this.isEditing = false;
    this.submitted = false;
    this.isLoading = false;
    this.customShiftType = '';
    this.clearValidationErrors();
  }

  confirmDelete(id?: string) {
    if (!id) return; 
    this.showDeleteConfirm = true;
    this.shiftToDeleteId = id;
  }

  cancelDelete() {
    this.showDeleteConfirm = false;
    this.shiftToDeleteId = null;
  }

  deleteShiftConfirmed() {
    if (!this.shiftToDeleteId) return;

    this.isLoading = true;

    this.crud.delete<Shift>('shifts', this.shiftToDeleteId).subscribe({
      next: (res: any) => {
        this.isLoading = false;
        
        // إزالة من القائمة المحلية
        this.shifts = this.shifts.filter(s => (s._id !== this.shiftToDeleteId && s.id !== this.shiftToDeleteId));
        
        // تحديث الفلترة والترقيم
        this.applyFilters();
        
        this.toastr.success(res?.message || 'Shift deleted successfully');
        this.cancelDelete();
        
        // إعادة تحميل البيانات للتأكد من المزامنة
        this.refreshData();
      },
      error: (err) => {
        this.isLoading = false;
        this.handleApiError(err);
      },
    });
  }

  // Helper function to get department name
  getDepartmentName(deptId: string | undefined): string {
    if (!deptId) return 'Not assigned';
    const dept = this.departments.find(d => d._id === deptId);
    return dept ? dept.name : 'Unknown';
  }

  // Helper function to get sub-department name
  getSubDepartmentName(subDeptId: string | undefined): string {
    if (!subDeptId) return 'Not assigned';
    const subDept = this.subDepartments.find(s => s._id === subDeptId);
    return subDept?.name?? 'Unknown';
  }
}