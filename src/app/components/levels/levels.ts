import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CrudService } from '../../services/crud.service';
import { SharedService } from '../../services/shared.service';
import { LevelI } from '../../models/level-i';
import { PositionI } from '../../models/position-i';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-levels',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './levels.html',
  styleUrls: ['./levels.css']
})
export class Levels implements OnInit {
  levels: LevelI[] = [];
  filteredLevels: LevelI[] = [];
  positions: PositionI[] = [];
  loading = false;
  showForm = false;
  showDeleteConfirm = false;
  editingLevel: LevelI | null = null;
  deleteLevelId: string | null = null;
  deleteLevelName = '';
  
  // Search and Filter
  searchTerm = '';
  selectedPositionId = '';
  showPositionFilter = false;
  
  // Form data
  levelName = '';
  formSelectedPositionId = '';

  // Validation states
  formErrors = {
    levelName: '',
    position: ''
  };

  // Loading states
  formSubmitting = false;
  deleteSubmitting = false;

  constructor(
    private crud: CrudService,
    private shared: SharedService,
    private toastr: ToastrService
  ) {}

  ngOnInit() {
    this.loadLevels();
    this.shared.getLevels().subscribe(levels => {
      this.levels = levels;
      this.filteredLevels = levels;
    });
    this.shared.getPositions().subscribe(positions => {
      this.positions = positions;
    });
  }

  loadLevels(): void {
    this.loading = true;
    this.shared.refetchAll();
    this.loading = false;
  }

  // Search and Filter Functions
  onSearch(): void {
    this.applyFilters();
  }

  filterByPosition(positionId: string): void {
    this.selectedPositionId = positionId;
    this.showPositionFilter = false;
    this.applyFilters();
  }

  clearPositionFilter(): void {
    this.selectedPositionId = '';
    this.applyFilters();
  }

  applyFilters(): void {
    let filtered = this.levels;

    // Filter by position
    if (this.selectedPositionId) {
      filtered = filtered.filter(level => level.positionId === this.selectedPositionId);
    }

    // Filter by search term
    if (this.searchTerm.trim()) {
      const term = this.searchTerm.toLowerCase().trim();
      filtered = filtered.filter(level => 
        level.name.toLowerCase().includes(term) ||
        this.getPositionName(level.positionId).toLowerCase().includes(term)
      );
    }

    this.filteredLevels = filtered;
  }

  togglePositionFilter(): void {
    this.showPositionFilter = !this.showPositionFilter;
  }

  clearSearch(): void {
    this.searchTerm = '';
    this.applyFilters();
  }

  hasActiveFilters(): boolean {
    return !!this.searchTerm || !!this.selectedPositionId;
  }

  refreshData(): void {
    this.loading = true;
    this.shared.refetchAll();
    setTimeout(() => {
      this.loading = false;
      this.toastr.success('Data refreshed successfully');
    }, 1000);
  }

  // Form Validation
  validateForm(): boolean {
    this.clearFormErrors();

    let isValid = true;

    // Level Name validation
    if (!this.levelName.trim()) {
      this.formErrors.levelName = 'Level name is required';
      isValid = false;
    } else if (this.levelName.trim().length < 2) {
      this.formErrors.levelName = 'Level name must be at least 2 characters';
      isValid = false;
    } else if (this.levelName.trim().length > 50) {
      this.formErrors.levelName = 'Level name cannot exceed 50 characters';
      isValid = false;
    }

    // Position validation
    if (!this.formSelectedPositionId) {
      this.formErrors.position = 'Please select a position';
      isValid = false;
    }

    return isValid;
  }

  clearFormErrors(): void {
    this.formErrors = {
      levelName: '',
      position: ''
    };
  }

  // Field-specific validation
  validateField(fieldName: string, value: string): void {
    switch (fieldName) {
    case 'levelName':
  if (!value.trim()) {
    this.formErrors.levelName = 'Level name is required';
  } else if (!/^[a-zA-Z\u0600-\u06FF\s]+$/.test(value.trim())) {
    this.formErrors.levelName = 'Level name must contain letters only';
  } else if (value.trim().length < 2) {
    this.formErrors.levelName = 'Level name must be at least 2 characters';
  } else if (value.trim().length > 50) {
    this.formErrors.levelName = 'Level name cannot exceed 50 characters';
  } else {
    this.formErrors.levelName = '';
  }
  break;  
      
      case 'position':
        if (!value) {
          this.formErrors.position = 'Please select a position';
        } else {
          this.formErrors.position = '';
        }
        break;
    }
  }

  // Original CRUD functions
  openAddForm(): void {
    this.showForm = true;
    this.editingLevel = null;
    this.levelName = '';
    this.formSelectedPositionId = '';
    this.clearFormErrors();
  }

  openEditForm(level: LevelI): void {
    this.showForm = true;
    this.editingLevel = level;
    this.levelName = level.name;
    this.formSelectedPositionId = level.positionId;
    this.clearFormErrors();
  }

  closeForm(): void {
    this.showForm = false;
    this.editingLevel = null;
    this.levelName = '';
    this.formSelectedPositionId = '';
    this.clearFormErrors();
    this.formSubmitting = false;
  }

  submitForm(): void {
    if (!this.validateForm()) {
      this.toastr.warning('Please fix the form errors before submitting');
      return;
    }

    this.formSubmitting = true;

    const levelData = { 
      name: this.levelName.trim(),
      positionId: this.formSelectedPositionId
    };

    if (this.editingLevel) {
      this.crud.update<LevelI>('levels', this.editingLevel._id!, levelData)
        .subscribe({
          next: (response) => {
            this.toastr.success('Level updated successfully');
            this.closeForm();
            this.loadLevels();
            this.formSubmitting = false;
          },
          error: (error) => {
            this.formSubmitting = false;
            this.handleError(error, 'Failed to update level');
          }
        });
    } else {
      this.crud.create<LevelI>('levels', levelData)
        .subscribe({
          next: (response) => {
            this.toastr.success('Level created successfully');
            this.closeForm();
            this.loadLevels();
            this.formSubmitting = false;
          },
          error: (error) => {
            this.formSubmitting = false;
            this.handleError(error, 'Failed to create level');
          }
        });
    }
  }

  deleteLevel(level: LevelI): void {
    this.showDeleteConfirm = true;
    this.deleteLevelId = level._id!;
    this.deleteLevelName = level.name;
  }

  cancelDelete(): void {
    this.showDeleteConfirm = false;
    this.deleteLevelId = null;
    this.deleteLevelName = '';
    this.deleteSubmitting = false;
  }

  confirmDelete(): void {
    if (!this.deleteLevelId) return;

    this.deleteSubmitting = true;

    this.crud.delete('levels', this.deleteLevelId)
      .subscribe({
        next: () => {
          this.toastr.success('Level deleted successfully');
          this.loadLevels();
          this.cancelDelete();
        },
        error: (error) => {
          this.deleteSubmitting = false;
          this.handleError(error, 'Failed to delete level');
        }
      });
  }

  // Enhanced error handling
  private handleError(error: any, defaultMessage: string): void {
    console.error('API Error:', error);

    if (error?.error?.message) {
      // Handle specific backend error messages
      const backendMessage = error.error.message;
      
      if (backendMessage.includes('duplicate') || backendMessage.includes('already exists')) {
        this.toastr.error('A level with this name already exists for the selected position');
      } else if (backendMessage.includes('required')) {
        this.toastr.error('Please fill all required fields');
      } else if (backendMessage.includes('validation')) {
        this.toastr.error('Invalid data provided. Please check your input');
      } else if (backendMessage.includes('not found')) {
        this.toastr.error('The requested resource was not found');
      } else if (error.status === 401) {
        this.toastr.error('Session expired. Please login again');
      } else if (error.status === 403) {
        this.toastr.error('You do not have permission to perform this action');
      } else if (error.status === 409) {
        this.toastr.error('This level cannot be deleted because it is associated with other records');
      } else if (error.status >= 500) {
        this.toastr.error('Server error. Please try again later');
      } else {
        this.toastr.error(backendMessage || defaultMessage);
      }
    } else if (error.status === 0) {
      this.toastr.error('Network error. Please check your connection');
    } else {
      this.toastr.error(defaultMessage);
    }
  }

  getPositionName(positionId: string): string {
    const position = this.positions.find(p => p._id === positionId);
    return position ? position.name : 'Unknown Position';
  }

  // Check if form has errors
  hasFormErrors(): boolean {
    return !!this.formErrors.levelName || !!this.formErrors.position;
  }
}