import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { UserProfileI } from '../../models/user-profile';
import { CrudService } from '../../services/crud.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './profile.html',
})
export class Profile implements OnInit {
  admin: UserProfileI = {
    _id: '',
    firstName: '',
    lastName: '',
    email: '',
    role: '',
    employeeId: '',
    nickname: '',
    contactNumber: '',
    photo: '',
    department: { _id: '', name: '' },
    position: { _id: '', name: '' },
    level: { _id: '', name: '' }
  };
  
  tempAdmin: UserProfileI = {
    _id: '',
    firstName: '',
    lastName: '',
    email: '',
    role: '',
    employeeId: '',
    nickname: '',
    contactNumber: '',
    photo: '',
    department: { _id: '', name: '' },
    position: { _id: '', name: '' },
    level: { _id: '', name: '' }
  };
  
  showEditForm = false;
  loading = false;

  constructor(
    private toastr: ToastrService,
    private crud: CrudService
  ) {}

  ngOnInit() {
    this.loadProfile();
  }

  loadProfile() {
    this.loading = true;
    this.crud.getAll<UserProfileI>('users/me').subscribe({
      next: (res: any) => {
        this.loading = false;
        if (res?.data) {
          this.admin = {
            _id: res.data._id || '',
            firstName: res.data.firstName || '',
            lastName: res.data.lastName || '',
            email: res.data.email || '',
            role: res.data.role || '',
            employeeId: res.data.employeeId || '',
            nickname: res.data.nickname || '',
            contactNumber: res.data.contactNumber || '',
            photo: res.data.photo || '',
            department: res.data.department || { _id: '', name: '' },
            position: res.data.position || { _id: '', name: '' },
            level: res.data.level || { _id: '', name: '' }
          };
          this.tempAdmin = { ...this.admin };
        }
      },
      error: (err) => {
        this.loading = false;
        console.error(err);
        this.toastr.error('Failed to load profile');
      },
    });
  }

  openEditForm() {
    this.tempAdmin = { ...this.admin };
    this.showEditForm = true;
  }

  closeForm() {
    this.showEditForm = false;
  }

  saveChanges() {
    if (!this.tempAdmin.firstName || !this.tempAdmin.lastName || !this.tempAdmin.email) {
      this.toastr.error('Please fill in all required fields');
      return;
    }

    const body: any = {
      firstName: this.tempAdmin.firstName,
      lastName: this.tempAdmin.lastName,
      email: this.tempAdmin.email
    };

    // إضافة الحقول الاختيارية فقط إذا كانت موجودة
    if (this.tempAdmin.nickname !== undefined) {
      body.nickname = this.tempAdmin.nickname;
    }
    if (this.tempAdmin.contactNumber !== undefined) {
      body.contactNumber = this.tempAdmin.contactNumber;
    }

    this.crud.customPatch<UserProfileI>('users/updateMe', body).subscribe({
      next: (res: any) => {
        if (res?.data) {
          this.admin = {
            ...res.data,
            department: res.data.department || this.admin.department,
            position: res.data.position || this.admin.position,
            level: res.data.level || this.admin.level
          };
          this.toastr.success('Profile updated successfully');
        } else {
          this.toastr.success('Profile updated successfully');
        }
        this.showEditForm = false;
      },
      error: (err) => {
        console.error(err);
        const errorMessage = err?.error?.message || err?.error?.details || 'Failed to update profile';
        this.toastr.error(errorMessage);
      },
    });
  }
}