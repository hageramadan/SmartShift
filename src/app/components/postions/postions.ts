import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CrudService } from '../../services/crud.service';
import { SharedService } from '../../services/shared.service';
import { PositionI } from '../../models/position-i';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-postions',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './postions.html',
  styleUrls: ['./postions.css']
})
export class Postions implements OnInit {
  positions: PositionI[] = [];
  filteredPositions: PositionI[] = [];
  loading = false;
  showForm = false;
  showDeleteConfirm = false;
  editingPosition: PositionI | null = null;
  deletePositionId: string | null = null;
  deletePositionName = '';
  
  // Search
  searchTerm = '';
  
  positionName = '';

  constructor(
    private crud: CrudService,
    private shared: SharedService,
    private toastr: ToastrService
  ) {}

  ngOnInit() {
    this.loadPositions();
    this.shared.getPositions().subscribe(positions => {
      this.positions = positions;
      this.filteredPositions = positions;
    });
  }

  loadPositions(): void {
    this.loading = true;
    this.shared.refetchAll();
    this.loading = false;
  }

  // Search Functions
  onSearch(): void {
    this.applySearch();
  }

  applySearch(): void {
    if (!this.searchTerm.trim()) {
      this.filteredPositions = this.positions;
      return;
    }

    const term = this.searchTerm.toLowerCase().trim();
    this.filteredPositions = this.positions.filter(position => 
      position.name.toLowerCase().includes(term)
    );
  }

  clearSearch(): void {
    this.searchTerm = '';
    this.filteredPositions = this.positions;
  }

  hasActiveSearch(): boolean {
    return !!this.searchTerm;
  }

  refreshData(): void {
    this.loading = true;
    this.shared.refetchAll();
    setTimeout(() => {
      this.loading = false;
      this.toastr.success('Data refreshed successfully');
    }, 1000);
  }

  // Original CRUD functions
  openAddForm(): void {
    this.showForm = true;
    this.editingPosition = null;
    this.positionName = '';
  }

  openEditForm(position: PositionI): void {
    this.showForm = true;
    this.editingPosition = position;
    this.positionName = position.name;
  }

  closeForm(): void {
    this.showForm = false;
    this.editingPosition = null;
    this.positionName = '';
  }

  submitForm(): void {
    if (!this.positionName.trim()) {
      this.toastr.warning('Please enter position name');
      return;
    }

    const positionData = { name: this.positionName.trim() };

    if (this.editingPosition) {
      this.crud.update<PositionI>('positions', this.editingPosition._id!, positionData)
        .subscribe({
          next: (response) => {
            this.toastr.success('Position updated successfully');
            this.closeForm();
            this.loadPositions();
          },
          error: (error) => {
            this.toastr.error('Failed to update position');
          }
        });
    } else {
      this.crud.create<PositionI>('positions', positionData)
        .subscribe({
          next: (response) => {
            this.toastr.success('Position created successfully');
            this.closeForm();
            this.loadPositions();
          },
          error: (error) => {
            this.toastr.error('Failed to create position');
          }
        });
    }
  }

  deletePosition(position: PositionI): void {
    this.showDeleteConfirm = true;
    this.deletePositionId = position._id!;
    this.deletePositionName = position.name;
  }

  cancelDelete(): void {
    this.showDeleteConfirm = false;
    this.deletePositionId = null;
    this.deletePositionName = '';
  }

  confirmDelete(): void {
    if (!this.deletePositionId) return;

    this.crud.delete('positions', this.deletePositionId)
      .subscribe({
        next: () => {
          this.toastr.success('Position deleted successfully');
          this.loadPositions();
          this.cancelDelete();
        },
        error: (error) => {
          this.toastr.error('Failed to delete position');
        }
      });
  }
}