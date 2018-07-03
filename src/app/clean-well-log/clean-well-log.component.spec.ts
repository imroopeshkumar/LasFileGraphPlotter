import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CleanWellLogComponent } from './clean-well-log.component';

describe('CleanWellLogComponent', () => {
  let component: CleanWellLogComponent;
  let fixture: ComponentFixture<CleanWellLogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CleanWellLogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CleanWellLogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
