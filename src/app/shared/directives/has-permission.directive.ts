import { Directive, Input, TemplateRef, ViewContainerRef, OnInit, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';

@Directive({
  selector: '[appHasPermission]',
  standalone: true
})
export class HasPermissionDirective implements OnInit, OnDestroy {
  @Input() appHasPermission!: string; // Format: "site.permission" or just "site"
  @Input() appHasPermissionSite?: string; // Alternative: specify site separately
  @Input() appHasPermissionPermission?: string; // Alternative: specify permission separately
  
  private destroy$ = new Subject<void>();
  private hasView = false;

  constructor(
    private templateRef: TemplateRef<any>,
    private viewContainer: ViewContainerRef,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    // Subscribe to auth state changes
    this.authService.user$
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.updateView();
      });

    // Initial check
    this.updateView();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private updateView(): void {
    const hasPermission = this.checkPermission();

    if (hasPermission && !this.hasView) {
      this.viewContainer.createEmbeddedView(this.templateRef);
      this.hasView = true;
    } else if (!hasPermission && this.hasView) {
      this.viewContainer.clear();
      this.hasView = false;
    }
  }

  private checkPermission(): boolean {
    let site: string;
    let permission: string;

    if (this.appHasPermission) {
      // Parse "site.permission" format
      const parts = this.appHasPermission.split('.');
      site = parts[0];
      permission = parts[1] || 'access'; // Default to 'access' if no permission specified
    } else if (this.appHasPermissionSite && this.appHasPermissionPermission) {
      // Use separate inputs
      site = this.appHasPermissionSite;
      permission = this.appHasPermissionPermission;
    } else {
      console.warn('HasPermissionDirective: No permission specified');
      return false;
    }

    return this.authService.hasPermission(site, permission);
  }
}
