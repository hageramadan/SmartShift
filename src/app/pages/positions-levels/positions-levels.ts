import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Postions } from "../../components/postions/postions";
import { Levels } from "../../components/levels/levels";
import { SharedService } from '../../services/shared.service';
import { PositionI } from '../../models/position-i';
import { LevelI } from '../../models/level-i';

@Component({
  selector: 'app-positions-levels',
  standalone: true,
  imports: [CommonModule, Postions, Levels],
  templateUrl: './positions-levels.html',
  styleUrl: './positions-levels.css',
})
export class PositionsLevels implements OnInit {
  positionsCount = 0;
  levelsCount = 0;
  activeTab: 'positions' | 'levels' = 'positions';
  loading = true;

  constructor(private shared: SharedService) {}

  ngOnInit() {
    this.shared.getPositions().subscribe({
      next: (positions: PositionI[]) => {
        this.positionsCount = positions.length;
        this.checkLoading();
      },
      error: (error) => {
        console.error('Error loading positions:', error);
        this.checkLoading();
      }
    });

    this.shared.getLevels().subscribe({
      next: (levels: LevelI[]) => {
        this.levelsCount = levels.length;
        this.checkLoading();
      },
      error: (error) => {
        console.error('Error loading levels:', error);
        this.checkLoading();
      }
    });
  }

  private checkLoading(): void {
    setTimeout(() => {
      this.loading = false;
    }, 500);
  }

  setActiveTab(tab: 'positions' | 'levels'): void {
    this.activeTab = tab;
  }

  isActiveTab(tab: 'positions' | 'levels'): boolean {
    return this.activeTab === tab;
  }

  getTabClass(tab: 'positions' | 'levels'): string {
    if (this.isActiveTab(tab)) {
      return tab === 'positions'
        ? 'bg-pro2 text-pro border-blue-100 shadow-sm'
        : 'bg-green-50 text-green-700 border-green-200 shadow-sm';
    } else {
      return 'text-gray-600 hover:text-gray-900 hover:bg-gray-50';
    }
  }

  getBadgeClass(tab: 'positions' | 'levels'): string {
    if (this.isActiveTab(tab)) {
      return tab === 'positions'
        ? 'bg-blue-600 text-white'
        : 'bg-green-600 text-white';
    } else {
      return 'bg-gray-200 text-gray-700';
    }
  }
}
