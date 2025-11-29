import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { CrudService } from '../../services/crud.service';
import { SharedService } from '../../services/shared.service';
import { SubDepartmentI } from '../../models/sub-department-i';
import { UserI } from '../../models/user-i';
import { DepartmentI } from '../../models/department-i';
import { AuthService } from '../../services/auth.service';

interface Filters {
  name: string;
  departmentId: string;
  subManagerId: string;
}

@Component({
  selector: 'app-subdepartments',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './sub-departments.html',
  styleUrls: ['./sub-departments.css'],
})
export class SubDepartmentsComponent implements OnInit {
  subDepartments: SubDepartmentI[] = [];
  filteredSubDepartments: SubDepartmentI[] = [];
  paginatedSubDepartments: SubDepartmentI[] = [];
  users: UserI[] = [];
  departments: DepartmentI[] = [];

  formData: Partial<SubDepartmentI> = {};
  selectedSub: SubDepartmentI | null = null;

  showForm = false;
  showConfirm = false;
  deleteId: string | null = null;
  submitted = false;

  // Pagination
  currentPage = 1;
  pageSize = 10;
  totalPages = 1;

  // Filters
  filters: Filters = {
    name: '',
    departmentId: '',
    subManagerId: ''
  };

  // Loading states
  isLoading = false;
  isDataLoading = true;

  // Current user info
  currentUser: UserI | null = null;
  isManager = false;
  userDepartmentId = '';


  constructor(
    private toastr: ToastrService,
    private sharedSrv: SharedService,
    private crud: CrudService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.loadCurrentUser();
    this.loadData();
  }

  loadCurrentUser() {
  this.currentUser = this.authService.getCurrentUser();
  this.isManager = this.currentUser?.role === 'manager';
  this.userDepartmentId = this.currentUser?.departmentId || '';
  if (this.isManager) {
    this.filters.departmentId = this.userDepartmentId;
    this.formData.departmentId = this.userDepartmentId;
  }
}

  loadData() {
    this.isDataLoading = true;
    this.sharedSrv.loadAll();

    this.sharedSrv.getUsers().subscribe((users) => {
      this.users = users;
      this.checkDataLoaded();
    });

    this.sharedSrv.getDepartments().subscribe((deps) => {
      this.departments = deps;
      this.checkDataLoaded();
    });

    this.sharedSrv.getSubDepartments().subscribe((sdeps) => {
      this.subDepartments = sdeps;
      this.applyFilters();
      this.isDataLoading = false;
    });
  }

  private checkDataLoaded() {
    // Helper method to check if all data is loaded
    if (this.users.length > 0 && this.departments.length > 0 && this.subDepartments.length > 0) {
      this.isDataLoading = false;
    }
  }

  getDepartmentName(deptId: string | undefined): string {
    if (!deptId) return '-';
    const dept = this.departments.find(d => d._id === deptId);
    return dept ? dept.name : 'Unknown';
  }

  getManagerName(managerId: string | undefined): string {
    if (!managerId) return '-';
    const mgr = this.users.find(m => m._id === managerId);
    return mgr ? mgr.fullName : 'Unknown';
  }

  get managers() {
    return this.users.filter((u) => u.role === 'manager');
  }

getFilteredManagers() {
  if (!this.isManager) {
    return this.managers;
  }
  return this.managers.filter(manager =>
    manager.departmentId === this.userDepartmentId &&
    manager._id !== this.currentUser?._id
  );
}
  // Filter Methods
  applyFilters() {
    this.currentPage = 1;
    this.filteredSubDepartments = this.subDepartments.filter(sub => {
      const nameMatch = !this.filters.name ||
        sub.name?.toLowerCase().includes(this.filters.name.toLowerCase());

      const departmentMatch = !this.filters.departmentId ||
        sub.departmentId === this.filters.departmentId;

      const managerMatch = !this.filters.subManagerId ||
        sub.subManagerId === this.filters.subManagerId;

      return nameMatch && departmentMatch && managerMatch;
    });

    this.updatePagination();
  }

  clearFilters() {
    this.filters = {
      name: '',
      departmentId: '',
      subManagerId: ''
    };
    if (this.isManager) {
    this.filters.departmentId = this.userDepartmentId;
    }
    this.applyFilters();
  }

  // Pagination Methods
  updatePagination() {
    this.totalPages = Math.ceil(this.filteredSubDepartments.length / this.pageSize);
    const startIndex = (this.currentPage - 1) * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    this.paginatedSubDepartments = this.filteredSubDepartments.slice(startIndex, endIndex);
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

  // CRUD Operations
  addSubDepartment() {
    this.showForm = true;
    this.selectedSub = null;
    this.submitted = false;
    this.formData = {
      name: '',
      departmentId: '',
      subManagerId: '',
    };
    if (this.isManager) {
    this.formData.departmentId = this.userDepartmentId;
    }
  }

  editSubDepartment(sub: SubDepartmentI) {
    this.selectedSub = sub;
    this.showForm = true;
    this.submitted = false;

    this.formData = {
      name: sub.name || '',
      departmentId: sub.departmentId || '',
      subManagerId: sub.subManagerId || '',
    };
  }

  saveSubDepartment() {
    this.submitted = true;

    if (!this.formData.name || !this.formData.departmentId || !this.formData.subManagerId) {
      this.toastr.error('Please fill all required fields');
      return;
    }

    // تنظيف البيانات والتأكد من عدم وجود قيم undefined
    const payload: any = {
      name: (this.formData.name || '').trim(),
      departmentId: this.formData.departmentId || '',
      subManagerId: this.formData.subManagerId || ''
    };

    // إزالة الحقول الفارغة
    Object.keys(payload).forEach(key => {
      if (payload[key] === null || payload[key] === undefined || payload[key] === '') {
        delete payload[key];
      }
    });

    console.log('Saving sub-department:', payload);

    this.isLoading = true;

    let obs$;

    if (this.selectedSub) {
      // استخدام update العادي
      obs$ = this.crud.update('subdepartments', this.selectedSub._id || '', payload);
    } else {
      obs$ = this.crud.create('subdepartments', payload);
    }

    obs$.subscribe({
      next: (res: any) => {
        this.isLoading = false;
        console.log('API Response:', res);

        if (res || (res.data || res._id)) {
          this.handleSaveSuccess(res.data || res);
        } else {
          this.toastr.error('Unexpected response format from server');
        }
      },
      error: (err) => {
        this.isLoading = false;
        console.error('API Error:', err);
        this.handleSaveError(err);
      }
    });
  }

  private handleSaveSuccess(savedSubDepartment: any) {
    if (this.selectedSub) {
      // تحديث العنصر الموجود
      const index = this.subDepartments.findIndex(d => d._id === savedSubDepartment._id);
      if (index !== -1) {
        this.subDepartments[index] = { ...this.subDepartments[index], ...savedSubDepartment };
      }
      this.toastr.success('Sub-department updated successfully');
    } else {
      // إضافة عنصر جديد
      this.subDepartments = [savedSubDepartment, ...this.subDepartments];
      this.toastr.success('Sub-department created successfully');
      this.currentPage = 1; // الانتقال للصفحة الأولى
    }

    this.applyFilters();
    this.resetForm();
    this.refreshData(); // إعادة تحميل البيانات من السيرفر
  }

  private handleSaveError(err: any) {
    let errorMessage = 'Operation failed';

    if (err?.error) {
      if (typeof err.error === 'string') {
        errorMessage = err.error;
      } else if (err.error.message) {
        errorMessage = err.error.message;
      } else if (err.error.details) {
        errorMessage = err.error.details;
      } else if (err.error.error) {
        errorMessage = err.error.error;
      }
    }

    this.toastr.error(errorMessage);
  }

  // دالة مساعدة لإعادة تحميل البيانات من السيرفر
  refreshData() {
    this.sharedSrv.refetchAll();
    this.sharedSrv.getSubDepartments().subscribe({
      next: (subDeps) => {
        this.subDepartments = subDeps;
        this.applyFilters();
      },
      error: (err) => {
        console.error('Error refreshing data:', err);
      }
    });
  }

  resetForm() {
    this.showForm = false;
    this.submitted = false;
    this.selectedSub = null;
    this.formData = {};
    this.isLoading = false;
  }

  confirmDelete(id: string) {
    this.showConfirm = true;
    this.deleteId = id;
  }

  cancelDelete() {
    this.showConfirm = false;
    this.deleteId = null;
  }

  deleteSubConfirmed() {
    if (!this.deleteId) return;

    this.isLoading = true;

    this.crud.delete('subdepartments', this.deleteId).subscribe({
      next: (res: any) => {
        this.isLoading = false;

        // إزالة من القائمة المحلية
        this.subDepartments = this.subDepartments.filter((d) => d._id !== this.deleteId);

        // تحديث الفلترة والترقيم
        this.applyFilters();

        this.toastr.success(res?.message || 'Sub-department deleted successfully');
        this.cancelDelete();

        // إعادة تحميل البيانات للتأكد من المزامنة
        this.refreshData();
      },
      error: (err) => {
        this.isLoading = false;
        const errorMessage = err?.error?.message ||
                           err?.error?.details ||
                           'Delete failed';
        this.toastr.error(errorMessage);
      },
    });
  }
}
