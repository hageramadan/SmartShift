import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { UserService } from '../../services/user.service';
import { SharedService } from '../../services/shared.service';
import { UserI } from '../../models/user-i';
import { DepartmentI } from '../../models/department-i';
import { PositionI } from '../../models/position-i';
import { LevelI } from '../../models/level-i';
import { forkJoin, generate } from 'rxjs';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './users.html',
  styleUrls: ['./users.css'],
})
export class Users implements OnInit {
  users: UserI[] = [];
  departments: DepartmentI[] = [];
  positions: PositionI[] = [];
  levels: LevelI[] = [];
  roles = ['admin', 'manager', 'user'];

  formData: Partial<UserI> = {};

  selectedUser: UserI | null = null;
  showForm = false;
  showConfirm = false;
  deleteId: string | null = null;
  submitted = false;

  constructor(
    private toastr: ToastrService,
    private sharedSrv: SharedService,
    private userService: UserService,
  ) { }

  ngOnInit() {
    this.loadAllSharedData();
  }

  loadAllSharedData() {
    this.sharedSrv.loadAll();

    this.sharedSrv.getUsers().subscribe(users => (this.users = users));
    this.sharedSrv.getDepartments().subscribe(depts => (this.departments = depts));
    this.sharedSrv.getPositions().subscribe(poss => (this.positions = poss));
    this.sharedSrv.getLevels().subscribe(lvls => (this.levels = lvls));
  }

  addUser() {
    this.showForm = true;
    this.selectedUser = null;
    this.submitted = false;
    const idCounter = this.users.length + 1;
    const pass = 'Passw0rd' + idCounter;
    this.formData = {
      employeeId: idCounter.toString(),
      nickname: '',
      firstName: '',
      lastName: '',
      email: '',
      password: pass,
      contactNumber: '',
      departmentId: '',
      positionId: '',
      levelId: '',
      role: 'user'
    };
  }

  editUser(user: UserI) {
    this.selectedUser = user;
    this.formData = {
      firstName: user.firstName,
      lastName: user.lastName,
      nickname: user.nickname,
      email: user.email,
      contactNumber: user.contactNumber,
      role: user.role,
      positionId: user.position?._id,
      levelId: user.level?._id,
      departmentId: user.department?._id
    };
    this.showForm = true;
  }

  saveUser() {
    this.submitted = true;
    let payload: any = {};
    if (this.selectedUser) {
      // Only include fields that actually changed
      Object.keys(this.formData).forEach(key => {
        const newValue = (this.formData as any)[key];
        const oldValue = (this.selectedUser as any)[key];

        // Include if newValue is different from oldValue
        if (newValue !== oldValue) {
          payload[key] = newValue;
        }
      });
    } else {
      // For new user, send everything
      payload = { ...this.formData };
    }

  delete payload.position;
  delete payload.level;
  delete payload.department;

  const obs$ = this.selectedUser
    ? this.userService.updateUser(this.selectedUser._id, payload)
    : this.userService.createUser(payload);

  obs$.subscribe({
    next: (res: any) => {
      const savedUser = res;

      if (this.selectedUser) {
        const idx = this.users.findIndex(u => u._id === savedUser._id);
        if (idx !== -1) this.users[idx] = savedUser;
        this.toastr.success(res.message || 'User updated');
      } else {
        this.users = [savedUser, ...this.users];
        this.toastr.success(res.message || 'User created');
      }
      this.formData = {};
      this.selectedUser = null;
      this.showForm = false;
      this.submitted = false;
    },
    error: (err) => {
        this.toastr.error(err?.error?.details || 'Save failed');
      }
    });
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

    this.userService.deleteUser(this.deleteId).subscribe({
      next: (res: any) => {
        this.users = this.users.filter(u => u._id !== this.deleteId);
        this.toastr.info(res.message ||'User deleted');
        this.showConfirm = false;
        this.deleteId = null;
      },
      error: (err) => this.toastr.error(err?.error?.details || 'Delete failed')
    });
  }

  getRoleClass(role: string): string {
    switch (role) {
      case 'admin (Head)':
        return 'bg-pro text-white px-3 py-1 rounded-md text-sm font-medium';
      case 'manager':
        return 'bg-blue-100 text-blue-700 px-3 py-1 rounded-md text-sm font-medium';
      case 'staff':
        return 'bg-gray-100 text-gray-700 px-3 py-1 rounded-md text-sm font-medium';
      default:
        return '';
    }
  }

  trackByUserId(index: number, user: UserI) {
  return user._id;
}
}
