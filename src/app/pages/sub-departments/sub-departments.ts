import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { CrudService } from '../../services/crud.service';
import { SharedService } from '../../services/shared.service';
import { SubDepartmentI } from '../../models/sub-department-i';
import { UserI } from '../../models/user-i';
import { DepartmentI } from '../../models/department-i';

@Component({
  selector: 'app-subdepartments',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './sub-departments.html',
  styleUrls: ['./sub-departments.css'],
})
export class SubDepartmentsComponent implements OnInit {
  subDepartments: SubDepartmentI[] = [];
  users: UserI[] = [];
  departments: DepartmentI[] = [];

  formData: Partial<SubDepartmentI> = {};
  selectedSub: SubDepartmentI | null = null;

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

    this.sharedSrv.getUsers().subscribe((users) => (this.users = users));
    this.sharedSrv.getDepartments().subscribe((deps) => (this.departments = deps));
    this.sharedSrv.getSubDepartments().subscribe((sdeps) => (this.subDepartments = sdeps));
  }
getDepartmentName(deptId: string | undefined): string {
  if (!deptId) return '-';
  const dept = this.departments.find(d => d._id === deptId);
  return dept ? dept.name : 'Unknown';
}

getManagerName(managerId: string | undefined): string {
  if (!managerId) return '-';
  const mgr = this.users.find(m => m._id === managerId);
  return mgr ? mgr.fullName : 'Unknown';
}

  

  get managers() {
    return this.users.filter((u) => u.role === 'manager');
  }

  addSubDepartment() {
    this.showForm = true;
    this.selectedSub = null;
    this.submitted = false;
    this.formData = {
      name: '',
      departmentId: '',
      subManagerId: '',
    };
  }

  editSubDepartment(sub: SubDepartmentI) {
    this.selectedSub = sub;
    this.showForm = true;
    this.submitted = false;

    this.formData = {
      name: sub.name || '',
      departmentId: sub.departmentId || '',
      subManagerId: sub.subManagerId || '',
    };
  }

  saveSubDepartment() {
    this.submitted = true;

    if (!this.formData.name || !this.formData.departmentId || !this.formData.subManagerId) {
      this.toastr.error('Please fill all required fields');
      return;
    }

    const payload = {
      name: this.formData.name,
      departmentId: this.formData.departmentId,
      subManagerId: this.formData.subManagerId,
    };

    const obs$ = this.selectedSub
      ? this.crud.update('subdepartments', this.selectedSub._id || '', payload)
      : this.crud.create('subdepartments', payload);

    obs$.subscribe({
      next: (res: any) => {
        const saved = res.data || res;

        if (this.selectedSub) {
          const i = this.subDepartments.findIndex((d) => d._id === saved._id);
          if (i !== -1) this.subDepartments[i] = saved;
          this.toastr.success('SubDepartment Updated');
        } else {
          this.subDepartments = [saved, ...this.subDepartments];
          this.toastr.success('SubDepartment Created');
        }

        this.resetForm();
      },
      error: (err) => this.toastr.error(err?.error?.details || 'Save failed'),
    });
  }

  resetForm() {
    this.showForm = false;
    this.submitted = false;
    this.selectedSub = null;
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

  deleteSubConfirmed() {
    if (!this.deleteId) return;

    this.crud.delete('subdepartments', this.deleteId).subscribe({
      next: (res: any) => {
        this.subDepartments = this.subDepartments.filter((d) => d._id !== this.deleteId);
        this.toastr.info(res.message || 'SubDepartment deleted');
        this.cancelDelete();
      },
      error: (err) => this.toastr.error(err?.error?.details || 'Delete failed'),
    });
  }
}
