import { Component } from '@angular/core';
import { SwapCofigI } from '../../models/swap-cofig-i';
import { ToastrService } from 'ngx-toastr';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { FormGroup } from '@angular/forms';
import { FormBuilder } from '@angular/forms';
@Component({
  selector: 'app-swap-config',
  imports:[CommonModule, ReactiveFormsModule],
  templateUrl: './swap-config.html',
  styleUrl: './swap-config.css',
})
export class SwapConfig {
  configs: SwapCofigI[] = [
    {
      id: 1,
      department: 'Emergency Department',
      swapsEnabled: true,
      requiresApproval: true,
      minAdvanceNotice: 2,
      maxSwapsPerMonth: 4,
    },
    {
      id: 2,
      department: 'Intensive Care Unit',
      swapsEnabled: true,
      requiresApproval: true,
      minAdvanceNotice: 3,
      maxSwapsPerMonth: 3,
    },
  ];

  showForm = false;
  showConfirm = false;
  isEditing = false;
  selectedConfigId: number | null = null;
  form: FormGroup;
  configToDelete: SwapCofigI | null = null;

  constructor(private fb: FormBuilder, private toastr: ToastrService) {
    this.form = this.fb.group({
      department: ['', Validators.required],
      swapsEnabled: [false],
      requiresApproval: [false],
      minAdvanceNotice: [0, [Validators.required, Validators.min(1)]],
      maxSwapsPerMonth: [0, [Validators.required, Validators.min(1)]],
    });
  }

  openAddForm() {
    this.form.reset({
      swapsEnabled: false,
      requiresApproval: false,
      minAdvanceNotice: 0,
      maxSwapsPerMonth: 0,
    });
    this.isEditing = false;
    this.showForm = true;
  }

  editConfig(config: SwapCofigI) {
    this.form.patchValue(config);
    this.isEditing = true;
    this.selectedConfigId = config.id;
    this.showForm = true;
  }

  saveConfig() {
    if (this.form.invalid) {
      this.toastr.error('Please fill all required fields correctly.');
      return;
    }

    const formValue = this.form.value as SwapCofigI;

    if (this.isEditing) {
      const index = this.configs.findIndex(c => c.id === this.selectedConfigId);
      if (index !== -1) {
        // this.configs[index] = { id: this.selectedConfigId!, ...formValue };
        this.configs[index] = { ...formValue, id: this.selectedConfigId! };
      }
      this.toastr.success('Configuration updated successfully!');
    } else {
      // this.configs.push({ id: Date.now(), ...formValue });
      this.configs.push({ ...formValue, id: null }); // or any other default value for 'id'
      this.toastr.success('Configuration added successfully!');
    }

    this.showForm = false;
  }

  confirmDelete(config: SwapCofigI) {
    this.configToDelete = config;
    this.showConfirm = true;
  }

  deleteConfirmed() {
    if (this.configToDelete) {
      this.configs = this.configs.filter(c => c.id !== this.configToDelete!.id);
      this.toastr.success('Configuration deleted.');
      this.showConfirm = false;
      this.configToDelete = null;
    }
  }

  cancelDelete() {
    this.showConfirm = false;
    this.configToDelete = null;
  }

  closeForm() {
    this.showForm = false;}
}
