import { Component, OnInit } from '@angular/core';
import { DepartmentI } from '../../models/department-i';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { SharedService } from '../../services/shared.service';
import { CrudService } from '../../services/crud.service';
import { UserI } from '../../models/user-i';

@Component({
  selector: 'app-departments',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './departments.html',
  styleUrls: ['./departments.css'],
})
export class Departments implements OnInit {

  departments: DepartmentI[] = [];
  users: UserI[] = [];

  selectedDepartment: DepartmentI | null = null;
  showForm = false;
  showConfirm = false;

  submitted = false;
  deleteId: string | null = null;

  formData: Partial<DepartmentI> = {
    name: '',
    address: '',
    locationId: '',
    managerId: '',
    staffCount: 0
  };

  constructor(
    private toastr: ToastrService,
    private sharedSrv: SharedService,
    private crud: CrudService,
  ) {}

  ngOnInit() {
    this.loadAllSharedData();
  }

  loadAllSharedData() {
    this.sharedSrv.loadAll();

    // Users
   this.sharedSrv.getUsers().subscribe(res => {
  this.users = res || [];
});


    // Departments (API returns object with .data)
    this.sharedSrv.getDepartments().subscribe(res => {
     this.departments = res || [];

    });
  }

  // dynamic managers list
  get managers() {
    return this.users.filter(u => u.role === 'manager');
  }

  // =============================
  // ADD
  // =============================

  addDepartment() {
    this.selectedDepartment = null;
    this.showForm = true;
    this.submitted = false;

    this.formData = {
      name: '',
      address: '',
      locationId: '',
      managerId: '',
      staffCount: 0
    };
  }

  // =============================
  // EDIT
  // =============================

  editDepartment(dep: DepartmentI) {
    this.selectedDepartment = dep;

    this.formData = {
      name: dep.name,
      address: dep.address,
      locationId: dep.locationId,
      managerId: dep.managerId || '',
      staffCount: dep.staffCount
    };

    this.showForm = true;
  }

  // =============================
  // SAVE
  // =============================

  saveDepartment() {
    this.submitted = true;

    let payload: any = {};

    if (this.selectedDepartment) {
      // send only changed fields
      Object.keys(this.formData).forEach(key => {
        const newValue = (this.formData as any)[key];
        const oldValue = (this.selectedDepartment as any)[key];

        if (newValue !== oldValue) {
          payload[key] = newValue;
        }
      });
    } else {
      // new department
      payload = { ...this.formData };
    }

    const obs$ = this.selectedDepartment
      ? this.crud.update('departments', this.selectedDepartment._id, payload)
      : this.crud.create('departments', payload);

    obs$.subscribe({
      next: (res: any) => {

        const savedDep = res.data || res;

        if (this.selectedDepartment) {
          const idx = this.departments.findIndex(d => d._id === savedDep._id);
          if (idx !== -1) this.departments[idx] = savedDep;

          this.toastr.success(res.message || 'Department updated');
        } else {
          this.departments = [savedDep, ...this.departments];
          this.toastr.success(res.message || 'Department created');
        }

        this.showForm = false;
        this.submitted = false;
        this.selectedDepartment = null;
        this.formData = {};
      },

      error: (err) => {
        this.toastr.error(err?.error?.details || 'Save failed');
      }
    });
  }

  // =============================
  // DELETE
  // =============================

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

    this.crud.delete('departments', this.deleteId).subscribe({
      next: (res: any) => {
        this.departments = this.departments.filter(d => d._id !== this.deleteId);
        this.toastr.info(res.message || 'Department deleted');

        this.showConfirm = false;
        this.deleteId = null;
      },
      error: err => this.toastr.error(err?.error?.details || 'Delete failed')
    });
  }
}
