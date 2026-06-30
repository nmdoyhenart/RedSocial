import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalSession } from './modal-session';

describe('ModalSession', () => {
  let component: ModalSession;
  let fixture: ComponentFixture<ModalSession>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModalSession],
    }).compileComponents();

    fixture = TestBed.createComponent(ModalSession);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
