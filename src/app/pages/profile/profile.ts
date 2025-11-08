import { Component } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { AdminProfileI } from '../../models/admin-profile-i';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-profile',
  imports: [ CommonModule , FormsModule],
  templateUrl: './profile.html',
  styleUrl: './profile.css',
})
export class Profile {
 admin: AdminProfileI = {
    name: 'Dr. Sarah Johnson',
    position: 'Chief Administrator',
    email: 'sarah.johnson@hospital.com',
    department: 'Emergency Department',
    accessLevel: 'admin',
    totalShifts: 0,
    upcoming: 0,
    completed: 0,
    permissions: {
      systemAccess: true,
      manageDepartments: true,
      approveSwaps: true,
    },
  };

  showEditForm = false;
  tempAdmin: AdminProfileI = { ...this.admin };

  constructor(private toastr: ToastrService) {}

  openEditForm() {
    this.tempAdmin = { ...this.admin };
    this.showEditForm = true;
  }

  saveChanges() {
    if (!this.tempAdmin.name || !this.tempAdmin.email) {
      this.toastr.error('Please fill all required fields correctly');
      return;
    }

    this.admin = { ...this.tempAdmin };
    this.showEditForm = false;
    this.toastr.success('Profile updated successfully');
  }

  closeForm() {
    this.showEditForm = false;
  }
}
