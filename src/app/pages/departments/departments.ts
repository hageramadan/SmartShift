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
  locations: LocationI[] = [];

  formData: Partial<DepartmentI> = {};
  selectedDepartment: DepartmentI | null = null;

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
    this.sharedSrv.getLocations().subscribe((locs) => (this.locations = locs));
  }

  get managers() {
    return this.users.filter((u) => u.role === 'manager');
  }

  addDepartment() {
     this.showForm = true;
  this.selectedDepartment = null;
  this.submitted = false;
  this.formData = {
    name: '',
    managerId: '',
    locationId: '',
    location: { Address: '', name: '', id: '' },
  };
  }

editDepartment(dep: DepartmentI) {
  this.selectedDepartment = dep;
  this.showForm = true;
  this.submitted = false;

  this.formData = {
    name: dep.name || '',
    managerId: dep.managerId || '',
    locationId: dep.locationId || ''
  };
}



onLocationChange() {
  const selected = this.locations.find((l) => l._id === this.formData.locationId);
  if (selected) {
    this.formData.location = {
      Address: selected.Address || '',
      name: selected.name || '',
      id:selected._id
    };
  }
}

saveDepartment() {
  this.submitted = true;

  if (!this.formData.name || !this.formData.managerId || !this.formData.locationId) {
    this.toastr.error('Please fill all required fields');
    return;
  }

  const payload = {
    name: this.formData.name,
    managerId: this.formData.managerId,
    locationId: this.formData.locationId
  };

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
