import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SwapConfig } from './swap-config';

describe('SwapConfig', () => {
  let component: SwapConfig;
  let fixture: ComponentFixture<SwapConfig>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SwapConfig]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SwapConfig);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
