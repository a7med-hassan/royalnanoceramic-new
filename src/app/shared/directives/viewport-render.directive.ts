import { 
  Directive, 
  ElementRef, 
  OnInit, 
  OnDestroy, 
  TemplateRef, 
  ViewContainerRef 
} from '@angular/core';

@Directive({
  selector: '[appViewportRender]',
  standalone: true
})
export class ViewportRenderDirective implements OnInit, OnDestroy {
  private observer: IntersectionObserver | null = null;
  private hasRendered = false;

  constructor(
    private templateRef: TemplateRef<any>,
    private viewContainer: ViewContainerRef,
    private elementRef: ElementRef
  ) {}

  ngOnInit() {
    this.createObserver();
  }

  ngOnDestroy() {
    if (this.observer) {
      this.observer.disconnect();
    }
  }

  private createObserver() {
    const options = {
      root: null,
      rootMargin: '100px', // Start rendering 100px before visible
      threshold: 0
    };

    // Create placeholder element
    const placeholder = document.createElement('div');
    placeholder.style.minHeight = '100px';
    placeholder.className = 'viewport-placeholder';

    this.observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !this.hasRendered) {
          // Render the actual content
          this.viewContainer.createEmbeddedView(this.templateRef);
          this.hasRendered = true;
          
          // Stop observing
          if (this.observer) {
            this.observer.disconnect();
          }
        }
      });
    }, options);

    // Insert placeholder and observe it
    this.viewContainer.element.nativeElement.parentNode?.insertBefore(
      placeholder, 
      this.viewContainer.element.nativeElement
    );
    
    this.observer.observe(placeholder);
  }
}

