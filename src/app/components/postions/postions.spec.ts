import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Postions } from './postions';

describe('Postions', () => {
  let component: Postions;
  let fixture: ComponentFixture<Postions>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Postions]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Postions);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
