import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WellLogComponent } from './well-log.component';

describe('WellLogComponent', () => {
  let component: WellLogComponent;
  let fixture: ComponentFixture<WellLogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WellLogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WellLogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
