import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BeforeAfterSliderComponent } from './before-after-slider.component';
import { TranslationService } from '../../shared/services/translation.service';

describe('BeforeAfterSliderComponent', () => {
  let component: BeforeAfterSliderComponent;
  let fixture: ComponentFixture<BeforeAfterSliderComponent>;
  let mockTranslationService: jasmine.SpyObj<TranslationService>;

  beforeEach(async () => {
    mockTranslationService = jasmine.createSpyObj('TranslationService', ['getTranslation'], {
      isRtl$: false
    });

    await TestBed.configureTestingModule({
      imports: [BeforeAfterSliderComponent],
      providers: [
        { provide: TranslationService, useValue: mockTranslationService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(BeforeAfterSliderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have default images', () => {
    expect(component.images.length).toBeGreaterThan(0);
  });

  it('should start with currentImageIndex 0', () => {
    expect(component.currentImageIndex).toBe(0);
  });

  it('should start with sliderPosition 50', () => {
    expect(component.sliderPosition).toBe(50);
  });
});
