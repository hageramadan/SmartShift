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

  // Original CRUD functions
  openAddForm(): void {
    this.showForm = true;
    this.editingLevel = null;
    this.levelName = '';
    this.formSelectedPositionId = '';
  }

  openEditForm(level: LevelI): void {
    this.showForm = true;
    this.editingLevel = level;
    this.levelName = level.name;
    this.formSelectedPositionId = level.positionId;
  }

  closeForm(): void {
    this.showForm = false;
    this.editingLevel = null;
    this.levelName = '';
    this.formSelectedPositionId = '';
  }

  submitForm(): void {
    if (!this.levelName.trim()) {
      this.toastr.warning('Please enter level name');
      return;
    }

    if (!this.formSelectedPositionId) {
      this.toastr.warning('Please select a position');
      return;
    }

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
          },
          error: (error) => {
            this.toastr.error('Failed to update level');
          }
        });
    } else {
      this.crud.create<LevelI>('levels', levelData)
        .subscribe({
          next: (response) => {
            this.toastr.success('Level created successfully');
            this.closeForm();
            this.loadLevels();
          },
          error: (error) => {
            this.toastr.error('Failed to create level');
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
  }

  confirmDelete(): void {
    if (!this.deleteLevelId) return;

    this.crud.delete('levels', this.deleteLevelId)
      .subscribe({
        next: () => {
          this.toastr.success('Level deleted successfully');
          this.loadLevels();
          this.cancelDelete();
        },
        error: (error) => {
          this.toastr.error('Failed to delete level');
        }
      });
  }

  getPositionName(positionId: string): string {
    const position = this.positions.find(p => p._id === positionId);
    return position ? position.name : 'Unknown Position';
  }
}