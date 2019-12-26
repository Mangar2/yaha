import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RootMenuComponent } from './root-menu.component';

describe('RootMenuComponent', () => {
  let component: RootMenuComponent;
  let fixture: ComponentFixture<RootMenuComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RootMenuComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RootMenuComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
