import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { CrudService } from '../../services/crud.service';
import { SharedService } from '../../services/shared.service';

import { DepartmentI } from '../../models/department-i';
import { UserI } from '../../models/user-i';
import { LocationI } from '../../models/location-i';

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

  formData: Partial<DepartmentI> = {};
  selectedDepartment: DepartmentI | null = null;
locations: LocationI[] = [];

  showForm = false;
  showConfirm = false;
  deleteId: string | null = null;

  submitted = false;

  constructor(
    private toastr: ToastrService,
    private sharedSrv: SharedService,
    private crud: CrudService
  ) {}

  ngOnInit() {
    this.sharedSrv.loadAll();

    this.sharedSrv.getDepartments().subscribe((deps) => (this.departments = deps));
    this.sharedSrv.getUsers().subscribe((users) => (this.users = users));
    this.sharedSrv.getLocations().subscribe(locs => this.locations = locs);

  }

  get managers() {
    return this.users.filter((u) => u.role === 'manager');
  }

  // ================
  // ADD
  // ================
  addDepartment() {
    this.showForm = true;
    this.selectedDepartment = null;
    this.submitted = false;

    this.formData = {
      name: '',
      managerId: '',
      locationId: '',
      address: '',
      staffCount: 0
    };
  }

  // ================
  // EDIT
  // ================
  editDepartment(dep: DepartmentI) {
    this.selectedDepartment = dep;
    this.showForm = true;

    this.formData = {
      name: dep.name,
      managerId: dep.manager?._id,
      locationId: dep.location?.id,
      address: dep.address,
      staffCount: dep.staffCount
    };
  }

  // ================
  // SAVE
  // ================
  saveDepartment() {
    this.submitted = true;

    let payload: any = {};

    if (this.selectedDepartment) {
      // send only changed fields
      Object.keys(this.formData).forEach((key) => {
        const newValue = (this.formData as any)[key];
        const oldValue = (this.selectedDepartment as any)[key];
        if (newValue !== oldValue) payload[key] = newValue;
      });

    } else {
      payload = { ...this.formData };
    }

    const obs$ = this.selectedDepartment
      ? this.crud.update('departments', this.selectedDepartment._id, payload)
      : this.crud.create('departments', payload);

    obs$.subscribe({
      next: (res: any) => {
        const saved = res.data || res;

        if (this.selectedDepartment) {
          const i = this.departments.findIndex((d) => d._id === saved._id);
          if (i !== -1) this.departments[i] = saved;
          this.toastr.success('Department Updated');
        } else {
          this.departments = [saved, ...this.departments];
          this.toastr.success('Department Created');
        }

        this.resetForm();
      },
      error: (err) => this.toastr.error(err?.error?.details || 'Save failed'),
    });
  }

  resetForm() {
    this.showForm = false;
    this.submitted = false;
    this.selectedDepartment = null;
    this.formData = {};
  }

  // ================
  // DELETE
  // ================
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
        this.departments = this.departments.filter((d) => d._id !== this.deleteId);
        this.toastr.info(res.message || 'Department deleted');
        this.cancelDelete();
      },
      error: (err) => this.toastr.error(err?.error?.details || 'Delete failed'),
    });
  }
}
