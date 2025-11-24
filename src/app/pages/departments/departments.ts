import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { CrudService } from '../../services/crud.service';
import { SharedService } from '../../services/shared.service';
import { DepartmentI } from '../../models/department-i';
import { UserI } from '../../models/user-i';
import { LocationI } from '../../models/location-i';

interface Filters {
  name: string;
  managerId: string;
  locationId: string;
}

@Component({
  selector: 'app-departments',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './departments.html',
  styleUrls: ['./departments.css'],
})
export class Departments implements OnInit {
  departments: DepartmentI[] = [];
  filteredDepartments: DepartmentI[] = [];
  paginatedDepartments: DepartmentI[] = [];
  users: UserI[] = [];
  locations: LocationI[] = [];

  formData: Partial<DepartmentI> = {};
  selectedDepartment: DepartmentI | null = null;

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
    managerId: '',
    locationId: '',
  };

  // Loading states
  isLoading = false;

  constructor(
    private toastr: ToastrService,
    private sharedSrv: SharedService,
    private crud: CrudService
  ) {}

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.sharedSrv.loadAll();

    this.sharedSrv.getDepartments().subscribe((deps) => {
      this.departments = deps;
      this.applyFilters();
    });

    this.sharedSrv.getUsers().subscribe((users) => (this.users = users));
    this.sharedSrv.getLocations().subscribe((locs) => (this.locations = locs));
  }

  get managers() {
    return this.users.filter((u) => u.role === 'manager');
  }

  // Filter Methods
  applyFilters() {
    this.currentPage = 1;
    this.filteredDepartments = this.departments.filter((dep) => {
      const nameMatch =
        !this.filters.name || dep.name.toLowerCase().includes(this.filters.name.toLowerCase());

      const managerMatch = !this.filters.managerId || dep.managerId === this.filters.managerId;

      const locationMatch = !this.filters.locationId || dep.locationId === this.filters.locationId;

      return nameMatch && managerMatch && locationMatch;
    });

    this.updatePagination();
  }

  clearFilters() {
    this.filters = {
      name: '',
      managerId: '',
      locationId: '',
    };
    this.applyFilters();
  }

  // Pagination Methods
  updatePagination() {
    this.totalPages = Math.ceil(this.filteredDepartments.length / this.pageSize);
    const startIndex = (this.currentPage - 1) * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    this.paginatedDepartments = this.filteredDepartments.slice(startIndex, endIndex);
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

  Math = Math;

  addDepartment() {
    this.showForm = true;
    this.selectedDepartment = null;
    this.submitted = false;
    this.formData = {
      name: '',
      managerId: '',
      locationId: '',
    };
  }

  editDepartment(dep: DepartmentI) {
    this.selectedDepartment = dep;
    this.showForm = true;
    this.submitted = false;

    this.formData = {
      name: dep.name || '',
      managerId: dep.managerId || '',
      locationId: dep.locationId || '',
    };
  }

  saveDepartment() {
    this.submitted = true;

    if (!this.formData.name || !this.formData.managerId || !this.formData.locationId) {
      this.toastr.error('Please fill all required fields');
      return;
    }

    const payload: any = {
      name: (this.formData.name || '').trim(),
      managerId: this.formData.managerId || '',
      locationId: this.formData.locationId || '',
    };

    Object.keys(payload).forEach((key) => {
      if (payload[key] === null || payload[key] === undefined || payload[key] === '') {
        delete payload[key];
      }
    });

    console.log('Sending payload:', payload);

    this.isLoading = true;

    let obs$;

    if (this.selectedDepartment) {
      obs$ = this.crud.update('departments', this.selectedDepartment._id, payload);
    } else {
      obs$ = this.crud.create('departments', payload);
    }

    obs$.subscribe({
      next: (res: any) => {
        this.isLoading = false;
        console.log('API Response:', res);

        if (res || res.data || res._id) {
          this.handleSaveSuccess(res.data || res);
        } else {
          this.toastr.error('Unexpected response format from server');
        }
      },
      error: (err) => {
        this.isLoading = false;
        console.error('API Error:', err);
        this.handleSaveError(err);
      },
    });
  }

  private handleSaveSuccess(savedDepartment: any) {
    if (this.selectedDepartment) {
      const index = this.departments.findIndex((d) => d._id === savedDepartment._id);
      if (index !== -1) {
        this.departments[index] = { ...this.departments[index], ...savedDepartment };
      }
      this.toastr.success('Department updated successfully');
    } else {
      this.departments = [savedDepartment, ...this.departments];
      this.toastr.success('Department created successfully');
      this.currentPage = 1;
    }

    this.applyFilters();
    this.resetForm();
    this.refreshData();
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

  refreshData() {
    this.sharedSrv.refetchAll();
    this.sharedSrv.getDepartments().subscribe({
      next: (deps) => {
        this.departments = deps;
        this.applyFilters();
      },
      error: (err) => {
        console.error('Error refreshing data:', err);
      },
    });
  }

  resetForm() {
    this.showForm = false;
    this.submitted = false;
    this.selectedDepartment = null;
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

  deleteDepartmentConfirmed() {
    if (!this.deleteId) return;

    this.isLoading = true;

    this.crud.delete('departments', this.deleteId).subscribe({
      next: (res: any) => {
        this.isLoading = false;

        this.departments = this.departments.filter((d) => d._id !== this.deleteId);

        this.applyFilters();

        this.toastr.success(res?.message || 'Department deleted successfully');
        this.cancelDelete();

        this.refreshData();
      },
      error: (err) => {
        this.isLoading = false;
        const errorMessage = err?.error?.message || err?.error?.details || 'Delete failed';
        this.toastr.error(errorMessage);
      },
    });
  }
}
