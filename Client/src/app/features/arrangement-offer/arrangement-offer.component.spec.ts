import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ArrangementOfferComponent } from './arrangement-offer.component';

describe('ArrangementOfferComponent', () => {
  let component: ArrangementOfferComponent;
  let fixture: ComponentFixture<ArrangementOfferComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ArrangementOfferComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ArrangementOfferComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
