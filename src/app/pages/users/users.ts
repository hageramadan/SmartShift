import { AuthService } from '../../services/auth.service';
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { CrudService } from '../../services/crud.service';
import { SharedService } from '../../services/shared.service';
import { UserI } from '../../models/user-i';
import { DepartmentI } from '../../models/department-i';
import { PositionI } from '../../models/position-i';
import { LevelI } from '../../models/level-i';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './users.html',
  styleUrls: ['./users.css'],
})
export class Users implements OnInit {
  users: UserI[] = [];
  filteredUsers: UserI[] = [];
  departments: DepartmentI[] = [];
  positions: PositionI[] = [];
  levels: LevelI[] = [];
  roles = ['admin', 'manager', 'user'];

  // Filter variables
  selectedDepartmentId: string = '';
  selectedPositionId: string = '';
  selectedRole: string = '';
  searchTerm: string = '';

  // Current user info
  currentUser: UserI | null = null;
  isManager = false;
  userDepartmentId = '';

  // Pagination variables
  currentPage: number = 1;
  pageSize: number = 10;
  totalPages: number = 1;

  formData: any = {
    firstName: '',
    lastName: '',
    nickname: '',
    email: '',
    contactNumber: '',
    role: 'user',
    positionId: '',
    levelId: '',
    departmentId: '',
    password: ''
  };

  selectedUser: UserI | null = null;
  showForm = false;
  showConfirm = false;
  deleteId: string | null = null;
  submitted = false;
  loading = false;

  constructor(
    private toastr: ToastrService,
    private sharedSrv: SharedService,
    private crud: CrudService,
    private authService: AuthService
  ) { }

  ngOnInit() {
    this.loadCurrentUser();
    this.loadAllSharedData();
  }

  loadCurrentUser() {
  this.currentUser = this.authService.getCurrentUser();
  this.isManager = this.currentUser?.role === 'manager';
  this.userDepartmentId = this.currentUser?.departmentId || '';
  if (this.isManager) {
    this.selectedDepartmentId = this.userDepartmentId;
    this.formData.departmentId = this.userDepartmentId;
  }
}

getFilteredDepartments() {
  if (!this.isManager) {
    return this.departments;
  }
  return this.departments.filter(dept =>
    dept._id === this.userDepartmentId
  );
}

  loadAllSharedData() {
    this.sharedSrv.loadAll();
    this.sharedSrv.getUsers().subscribe(users => {
      this.users = users;
      this.applyFilters();
    });
    this.sharedSrv.getDepartments().subscribe(depts => (this.departments = depts));
    this.sharedSrv.getPositions().subscribe(poss => (this.positions = poss));
    this.sharedSrv.getLevels().subscribe(lvls => (this.levels = lvls));
  }

  // Generate custom employee ID
  generateEmployeeId(departmentId: string): string {
    const department = this.departments.find(d => d._id === departmentId);
    if (!department) return '';

    // Get first 3 letters of department name (uppercase)
    const deptPrefix = department.name.substring(0, 3).toUpperCase();

    // Get current year
    const currentYear = new Date().getFullYear();

    // Get the next index for this department and year
    const existingIds = this.users
      .filter(user => user.employeeId?.startsWith(`${deptPrefix}${currentYear}`))
      .map(user => {
        const idParts = user.employeeId?.split('-');
        return idParts && idParts.length > 1 ? parseInt(idParts[1]) : 0;
      });

    const nextIndex = existingIds.length > 0 ? Math.max(...existingIds) + 1 : 1;

    // Format: DEP2024-001
    return `${deptPrefix}${currentYear}-${nextIndex.toString().padStart(3, '0')}`;
  }

  // Filter methods
  applyFilters() {
    let filtered = [...this.users];
    if (this.isManager) {
    filtered = filtered.filter(user =>
      user.department?._id === this.userDepartmentId
    );
  }
    // Apply department filter
    if (this.selectedDepartmentId) {
      filtered = filtered.filter(user =>
        user.department?._id === this.selectedDepartmentId
      );
    }

    // Apply position filter
    if (this.selectedPositionId) {
      filtered = filtered.filter(user =>
        user.position?._id === this.selectedPositionId
      );
    }

    // Apply role filter
    if (this.selectedRole) {
      filtered = filtered.filter(user =>
        user.role === this.selectedRole
      );
    }

    // Apply search filter
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(user =>
        user.fullName?.toLowerCase().includes(term) ||
        user.email?.toLowerCase().includes(term) ||
        user.employeeId?.toLowerCase().includes(term)
      );
    }

    this.filteredUsers = filtered;
    this.updatePagination();
  }

  onSearch() {
    this.applyFilters();
  }

  clearSearch() {
    this.searchTerm = '';
    this.applyFilters();
  }

  clearDepartmentFilter() {
    this.selectedDepartmentId = '';
    this.applyFilters();
  }

  clearPositionFilter() {
    this.selectedPositionId = '';
    this.applyFilters();
  }

  clearRoleFilter() {
    this.selectedRole = '';
    this.applyFilters();
  }

  clearAllFilters() {
    this.selectedDepartmentId = '';
    this.selectedPositionId = '';
    this.selectedRole = '';
    this.searchTerm = '';
    if (this.isManager) {
    this.selectedDepartmentId = this.userDepartmentId;
    }
    this.applyFilters();
  }

  hasActiveFilters(): boolean {
    return !!this.selectedDepartmentId || !!this.selectedPositionId ||
           !!this.selectedRole || !!this.searchTerm;
  }

  getDepartmentName(departmentId: string): string {
    const department = this.departments.find(d => d._id === departmentId);
    return department?.name || 'Unknown';
  }

  getPositionName(positionId: string): string {
    const position = this.positions.find(p => p._id === positionId);
    return position?.name || 'Unknown';
  }

  // Pagination methods
  updatePagination() {
    this.totalPages = Math.ceil(this.filteredUsers.length / this.pageSize);
    this.currentPage = 1;
  }

  get paginatedUsers(): UserI[] {
    const startIndex = (this.currentPage - 1) * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    return this.filteredUsers.slice(startIndex, endIndex);
  }

  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
    }
  }

  previousPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
    }
  }

  refreshData() {
    this.loadAllSharedData();
    this.toastr.info('Data refreshed');
  }

  // User CRUD methods
  addUser() {
    this.showForm = true;
    this.selectedUser = null;
    this.submitted = false;
    this.formData = {
      firstName: '',
      lastName: '',
      nickname: '',
      email: '',
      contactNumber: '',
      role: 'user',
      positionId: '',
      levelId: '',
      departmentId: '',
      password: 'Passw0rd123@'
    };
    if (this.isManager) {
    this.formData.departmentId = this.userDepartmentId;
    }
  }

  editUser(user: UserI) {
    this.selectedUser = user;
    this.formData = {
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      nickname: user.nickname || '',
      email: user.email || '',
      contactNumber: user.contactNumber || '',
      role: user.role || 'user',
      positionId: user.position?._id || '',
      levelId: user.level?._id || '',
      departmentId: user.department?._id || ''
    };
    this.showForm = true;
    this.submitted = false;
  }

  validateForm(): boolean {
    const requiredFields = ['firstName', 'lastName', 'email', 'positionId', 'levelId', 'departmentId'];

    for (const field of requiredFields) {
      if (!this.formData[field]) {
        this.toastr.error(`${this.getFieldLabel(field)} is required`);
        return false;
      }
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (this.formData.email && !emailRegex.test(this.formData.email)) {
      this.toastr.error('Please enter a valid email address');
      return false;
    }

    return true;
  }

  getFieldLabel(field: string): string {
    const labels: { [key: string]: string } = {
      firstName: 'First Name',
      lastName: 'Last Name',
      email: 'Email',
      positionId: 'Position',
      levelId: 'Level',
      departmentId: 'Department'
    };
    return labels[field] || field;
  }

  saveUser() {
    this.submitted = true;

    if (!this.validateForm()) {
      return;
    }

    this.loading = true;

    // Prepare payload
    let payload: any;

    if (this.selectedUser) {
      // Edit mode - only send changed fields
      payload = {};
      Object.keys(this.formData).forEach(key => {
        if (this.formData[key] !== (this.selectedUser as any)[key]) {
          payload[key] = this.formData[key];
        }
      });
    } else {
      // Create mode - send all data + generate employee ID
      payload = { ...this.formData };

      // Generate custom employee ID
      const employeeId = this.generateEmployeeId(this.formData.departmentId);
      if (!employeeId) {
        this.toastr.error('Failed to generate employee ID. Please check department selection.');
        this.loading = false;
        return;
      }

      payload.employeeId = employeeId;

      // Ensure required fields for creation
      if (!payload.password) {
        payload.password = 'Passw0rd123'; // Default password
      }
    }

    const obs$ = this.selectedUser
      ? this.crud.update<UserI>('users', this.selectedUser._id, payload)
      : this.crud.create<UserI>('users', payload);

    obs$.subscribe({
      next: (res: any) => {
        this.loading = false;

        if (res && res.data) {
          const savedUser = res.data;

          if (this.selectedUser) {
            // Update existing user in the list مع الـ relations
            const idx = this.users.findIndex(u => u._id === savedUser._id);
            if (idx !== -1) {
              this.users[idx] = {
                ...savedUser,
                department: this.departments.find(d => d._id === this.formData.departmentId) || this.users[idx].department,
                position: this.positions.find(p => p._id === this.formData.positionId) || this.users[idx].position,
                level: this.levels.find(l => l._id === this.formData.levelId) || this.users[idx].level,
                fullName: `${this.formData.firstName} ${this.formData.lastName}`
              };
            }
            this.toastr.success(res.message || 'User updated successfully');
          } else {
            // Add new user to the list مع الـ relations
            const newUserWithRelations = {
              ...savedUser,
              department: this.departments.find(d => d._id === this.formData.departmentId),
              position: this.positions.find(p => p._id === this.formData.positionId),
              level: this.levels.find(l => l._id === this.formData.levelId),
              fullName: `${this.formData.firstName} ${this.formData.lastName}`
            };

            this.users = [newUserWithRelations, ...this.users];
            this.toastr.success(res.message || 'User created successfully');
          }

          this.resetForm();
          this.applyFilters();
        } else {
          this.toastr.error('Invalid response from server');
        }
      },
      error: (err) => {
        this.loading = false;
        const errorMessage = err?.error?.message || err?.error?.details || 'Operation failed';
        this.toastr.error(errorMessage);
        console.error('Save error:', err);
      }
    });
  }

  resetForm() {
    this.formData = {
      firstName: '',
      lastName: '',
      nickname: '',
      email: '',
      contactNumber: '',
      role: 'user',
      positionId: '',
      levelId: '',
      departmentId: '',
      password: ''
    };
    this.selectedUser = null;
    this.showForm = false;
    this.submitted = false;
  }

  confirmDelete(id: string) {
    this.showConfirm = true;
    this.deleteId = id;
  }

  cancelDelete() {
    this.showConfirm = false;
    this.deleteId = null;
  }

  deleteUserConfirmed() {
    if (!this.deleteId) return;

    this.loading = true;

    this.crud.delete<UserI>('users', this.deleteId).subscribe({
      next: (res: any) => {
        this.loading = false;
        this.users = this.users.filter(u => u._id !== this.deleteId);
        this.toastr.success(res.message || 'User deleted successfully');
        this.showConfirm = false;
        this.deleteId = null;
        this.applyFilters();
      },
      error: (err) => {
        this.loading = false;
        const errorMessage = err?.error?.message || err?.error?.details || 'Delete failed';
        this.toastr.error(errorMessage);
        this.showConfirm = false;
        this.deleteId = null;
      }
    });
  }

  getRoleClass(role: string): string {
    switch (role) {
      case 'admin':
        return 'bg-red-100 text-gray-700 px-3 py-1 rounded-md text-sm font-medium';
      case 'manager':
        return 'bg-blue-100 text-gray-700 px-3 py-1 rounded-md text-sm font-medium';
      case 'user':
        return 'bg-gray-100 text-gray-700 px-3 py-1 rounded-md text-sm font-medium';
      default:
        return 'bg-gray-100 text-gray-700 px-3 py-1 rounded-md text-sm font-medium';
    }
  }

  trackByUserId(index: number, user: UserI) {
    return user._id;
  }
}
