import { Component, OnInit } from '@angular/core';
import { DepartmentI } from '../../models/department-i';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-departments',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './departments.html',
  styleUrls: ['./departments.css'],
})
export class Departments implements OnInit {
  departments: DepartmentI[] = [];
  selectedDepartment: DepartmentI | null = null;
  showForm = false;
  showConfirm = false;
  deleteId: number | null = null;
  submitted = false; // ✅ نتحقق هل المستخدم ضغط حفظ

  formData: DepartmentI = {
    id: 0,
    name: '',
    description: '',
    manager: '',
    staffCount: 0,
  };

  managers = [
    'Dr. Michael Chen',
    'Dr. James Wilson',
    'Dr. Sarah Johnson',
    'Dr. Emily Davis',
  ];

  constructor(private toastr: ToastrService) {}

  ngOnInit() {
    this.loadDepartments();
  }

  loadDepartments() {
    const saved = localStorage.getItem('departments');
    if (saved) {
      this.departments = JSON.parse(saved);
    } else {
      this.departments = [
        {
          id: 1,
          name: 'Emergency Department',
          description: 'Handles all emergency and urgent care patients',
          manager: 'Dr. Michael Chen',
          staffCount: 4,
        },
        {
          id: 2,
          name: 'Intensive Care Unit',
          description: 'Critical care for severely ill patients',
          manager: 'Dr. James Wilson',
          staffCount: 2,
        },
        {
          id: 3,
          name: 'Surgery Department',
          description: 'Surgical procedures and post-operative care',
          manager: 'Dr. Sarah Johnson',
          staffCount: 0,
        },
      ];
      this.saveToLocalStorage();
    }
  }

  saveToLocalStorage() {
    localStorage.setItem('departments', JSON.stringify(this.departments));
  }

  addDepartment() {
    this.showForm = true;
    this.selectedDepartment = null;
    this.formData = { id: 0, name: '', description: '', manager: '', staffCount: 0 };
    this.submitted = false;
  }

  editDepartment(dep: DepartmentI) {
    this.selectedDepartment = dep;
    this.formData = { ...dep };
    this.showForm = true;
    this.submitted = false;
  }

  saveDepartment() {
    this.submitted = true;
    const { name, description, manager } = this.formData;

    if (!name.trim() || !description.trim() || !manager.trim()) {
      this.toastr.warning('Please fill in all required fields.', 'Missing Data');
      return;
    }

    if (this.selectedDepartment) {
      const index = this.departments.findIndex(
        (d) => d.id === this.selectedDepartment?.id
      );
      this.departments[index] = { ...this.formData };
      this.toastr.success('Department updated successfully!', 'Updated');
    } else {
      const newDep = { ...this.formData, id: Date.now() };
      this.departments.push(newDep);
      this.toastr.success('Department created successfully!', 'Created');
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

  deleteDepartmentConfirmed() {
    if (this.deleteId !== null) {
      this.departments = this.departments.filter((d) => d.id !== this.deleteId);
      this.saveToLocalStorage();
      this.toastr.info('Department deleted successfully.', 'Deleted');
    }
    this.showConfirm = false;
    this.deleteId = null;
  }
}
