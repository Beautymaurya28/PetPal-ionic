import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReminderListPage } from './reminder-list.page';

describe('ReminderListPage', () => {
  let component: ReminderListPage;
  let fixture: ComponentFixture<ReminderListPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(ReminderListPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
