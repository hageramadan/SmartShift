import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SwapRequests } from './swap-requests';

describe('SwapRequests', () => {
  let component: SwapRequests;
  let fixture: ComponentFixture<SwapRequests>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SwapRequests]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SwapRequests);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
