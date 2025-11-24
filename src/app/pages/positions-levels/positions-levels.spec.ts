import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PositionsLevels } from './positions-levels';

describe('PositionsLevels', () => {
  let component: PositionsLevels;
  let fixture: ComponentFixture<PositionsLevels>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PositionsLevels]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PositionsLevels);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
