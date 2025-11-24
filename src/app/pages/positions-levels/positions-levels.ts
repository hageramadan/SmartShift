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

  constructor(private shared: SharedService) {}

  ngOnInit() {
    this.shared.getPositions().subscribe((positions: PositionI[]) => {
      this.positionsCount = positions.length;
    });

    this.shared.getLevels().subscribe((levels: LevelI[]) => {
      this.levelsCount = levels.length;
    });
  }
}