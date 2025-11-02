import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';

interface User {
  id: number;
  name: string;
  email: string;
  position: string;
  role: string;
  department: string;
}

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './users.html',
  styleUrls: ['./users.css'],
})
export class Users implements OnInit {
  users: User[] = [];
  departments = ['Emergency Department', 'Intensive Care Unit', 'Surgery Department'];
  roles = ['admin (Head)', 'manager', 'staff'];

  formData: User = {
    id: 0,
    name: '',
    email: '',
    position: '',
    role: '',
    department: '',
  };

  selectedUser: User | null = null;
  showForm = false;
  showConfirm = false;
  deleteId: number | null = null;
  submitted = false;

  constructor(private toastr: ToastrService) {}

  ngOnInit() {
    this.loadUsers();
  }

  loadUsers() {
    const saved = localStorage.getItem('users');
    if (saved) {
      this.users = JSON.parse(saved);
    } else {
      this.users = [
        {
          id: 1,
          name: 'Dr. Sarah Johnson',
          email: 'sarah.johnson@hospital.com',
          position: 'Chief Administrator',
          role: 'admin (Head)',
          department: 'Emergency Department',
        },
        {
          id: 2,
          name: 'Dr. Michael Chen',
          email: 'michael.chen@hospital.com',
          position: 'Emergency Department Manager',
          role: 'manager',
          department: 'Emergency Department',
        },
        {
          id: 3,
          name: 'Nurse Emily Rodriguez',
          email: 'emily.rodriguez@hospital.com',
          position: 'Registered Nurse',
          role: 'staff',
          department: 'Emergency Department',
        },
        {
          id: 4,
          name: 'Dr. James Wilson',
          email: 'james.wilson@hospital.com',
          position: 'ICU Manager',
          role: 'manager',
          department: 'Intensive Care Unit',
        },
        {
          id: 5,
          name: 'Nurse Lisa Taylor',
          email: 'lisa.taylor@hospital.com',
          position: 'ICU Nurse',
          role: 'staff',
          department: 'Intensive Care Unit',
        },
        {
          id: 6,
          name: 'Dr. Robert Brown',
          email: 'robert.brown@hospital.com',
          position: 'Attending Physician',
          role: 'staff',
          department: 'Emergency Department',
        },
      ];
      this.saveToLocalStorage();
    }
  }

  saveToLocalStorage() {
    localStorage.setItem('users', JSON.stringify(this.users));
  }

  addUser() {
    this.showForm = true;
    this.selectedUser = null;
    this.submitted = false;
    this.formData = {
      id: 0,
      name: '',
      email: '',
      position: '',
      role: '',
      department: '',
    };
  }

  editUser(user: User) {
    this.selectedUser = user;
    this.formData = { ...user };
    this.showForm = true;
  }

  saveUser() {
    this.submitted = true;
    const { name, email, position, role, department } = this.formData;

    if (!name.trim() || !email.trim() || !position.trim() || !role.trim() || !department.trim()) {
      this.toastr.warning('Please fill in all required fields.', 'Missing Data');
      return;
    }

    if (this.selectedUser) {
      const index = this.users.findIndex((u) => u.id === this.selectedUser?.id);
      this.users[index] = { ...this.formData };
      this.toastr.success('User updated successfully!', 'Updated');
    } else {
      const newUser = { ...this.formData, id: Date.now() };
      this.users.push(newUser);
      this.toastr.success('User created successfully!', 'Created');
    }

    this.saveToLocalStorage();
    this.showForm = false;
  }

  confirmDelete(id: number) {
    this.showConfirm = true;
    this.deleteId = id;
  }

  cancelDelete() {
    this.showConfirm = false;
    this.deleteId = null;
  }

  deleteUserConfirmed() {
    if (this.deleteId !== null) {
      this.users = this.users.filter((u) => u.id !== this.deleteId);
      this.saveToLocalStorage();
      this.toastr.info('User deleted successfully.', 'Deleted');
    }
    this.showConfirm = false;
    this.deleteId = null;
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
}
