import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { SubDepartmentI } from '../../models/sub-department-i';

interface DepartmentSimple {
  id: number;
  name: string;
  description?: string;
  manager?: string;
  staffCount?: number;
}



@Component({
  selector: 'app-subdepartments',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './sub-departments.html',
  styleUrls: ['./sub-departments.css'],
})
export class SubDepartmentsComponent implements OnInit {
  departments: DepartmentSimple[] = [];
  subdepartments: SubDepartmentI[] = [];

  // form / state
  showForm = false;
  submitted = false;
  editingSub: SubDepartmentI | null = null;

  form: Partial<SubDepartmentI> = {
    id: 0,
    name: '',
    parentId: null,
    description: ''
  };

  // delete confirm
  showConfirm = false;
  deleteId: number | null = null;

  constructor(private toastr: ToastrService) {}

  ngOnInit(): void {
    this.loadDepartments();
    this.loadSubdepartments();
  }

  // Departments come from localStorage 'departments' (the Departments component saves there)
  loadDepartments() {
    const raw = localStorage.getItem('departments');
    if (raw) {
      try {
        this.departments = JSON.parse(raw);
      } catch {
        this.departments = [];
      }
    } else {
      this.departments = [];
    }
  }

  loadSubdepartments() {
    const raw = localStorage.getItem('subdepartments');
    if (raw) {
      try {
        this.subdepartments = JSON.parse(raw);
      } catch {
        this.subdepartments = [];
      }
    } else {
      // initial example data
      this.subdepartments = [
        { id: 1, name: 'Trauma Unit', parentId: this.findDepartmentIdByName('Emergency Department'), description: 'Specializes in trauma and severe injuries' },
        { id: 2, name: 'Pediatric Emergency', parentId: this.findDepartmentIdByName('Emergency Department'), description: 'Emergency care for children' },
        { id: 3, name: 'Cardiac ICU', parentId: this.findDepartmentIdByName('Intensive Care Unit'), description: 'Intensive care for cardiac patients' },
        { id: 4, name: 'Neuro ICU', parentId: this.findDepartmentIdByName('Intensive Care Unit'), description: 'Intensive care for neurological patients' },
      ].filter(s => s.parentId !== null); // drop those with no parent found
      this.saveSubToStorage();
    }
  }

  saveSubToStorage() {
    localStorage.setItem('subdepartments', JSON.stringify(this.subdepartments));
  }

  // utility to get department name
  getDepartmentName(id: number | null): string {
    if (!id) return '-';
    const d = this.departments.find(x => x.id === id);
    return d ? d.name : 'Unknown';
  }

  // helper to attempt finding department id by name (used for sample seed)
  private findDepartmentIdByName(name: string): number | null {
    const d = this.departments.find(x => x.name?.toLowerCase() === name.toLowerCase());
    return d ? d.id : null;
  }

  // ---- form actions ----
  addSub() {
    this.loadDepartments(); // refresh parents
    this.showForm = true;
    this.editingSub = null;
    this.submitted = false;
    this.form = { id: 0, name: '', parentId: null, description: '' };
  }

  editSub(s: SubDepartmentI) {
    this.loadDepartments();
    this.editingSub = s;
    this.form = { ...s };
    this.showForm = true;
    this.submitted = false;
  }

  closeForm() {
    this.showForm = false;
    this.editingSub = null;
    this.submitted = false;
  }

  saveSub() {
    this.submitted = true;

    // validation: name, parentId, description required. staff count not relevant here.
    if (!this.form.name || !this.form.name.toString().trim() || !this.form.parentId || !this.form.description || !this.form.description.toString().trim()) {
      this.toastr.warning('Please fill in all required fields.', 'Missing Data');
      return;
    }

    if (this.editingSub) {
      // update
      const idx = this.subdepartments.findIndex(s => s.id === this.editingSub!.id);
      if (idx !== -1) {
        this.subdepartments[idx] = {
          id: this.editingSub.id,
          name: this.form.name!.toString(),
          parentId: Number(this.form.parentId),
          description: this.form.description!.toString()
        };
        this.toastr.success('Sub-department updated.', 'Updated');
      }
    } else {
      // create
      const newSub: SubDepartmentI = {
        id: Date.now(),
        name: this.form.name!.toString(),
        parentId: Number(this.form.parentId),
        description: this.form.description!.toString()
      };
      this.subdepartments.push(newSub);
      this.toastr.success('Sub-department created.', 'Created');
    }

    this.saveSubToStorage();
    this.closeForm();
  }

  // ---- delete flow with confirm modal ----
  confirmDeleteSub(id: number) {
    this.deleteId = id;
    this.showConfirm = true;
  }

  cancelDelete() {
    this.deleteId = null;
    this.showConfirm = false;
  }

  deleteSubConfirmed() {
    if (this.deleteId === null) {
      this.showConfirm = false;
      return;
    }
    this.subdepartments = this.subdepartments.filter(s => s.id !== this.deleteId);
    this.saveSubToStorage();
    this.toastr.info('Sub-department deleted.', 'Deleted');
    this.deleteId = null;
    this.showConfirm = false;
  }
}
