import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SubDepartments } from './sub-departments';

describe('SubDepartments', () => {
  let component: SubDepartments;
  let fixture: ComponentFixture<SubDepartments>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SubDepartments]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SubDepartments);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
