import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSelectModule } from '@angular/material/select';
import { MatCardModule } from '@angular/material/card';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatChipsModule } from '@angular/material/chips';
import { Subject, takeUntil } from 'rxjs';

import { AuthService, AppUser, UserPermissions } from '../../shared/services/auth.service';
import { UserService } from '../../shared/services/user.service';

@Component({
  selector: 'app-admin-manage-users',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatInputModule,
    MatFormFieldModule,
    MatIconModule,
    MatTableModule,
    MatCheckboxModule,
    MatSelectModule,
    MatCardModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    MatChipsModule
  ],
  templateUrl: './admin-manage-users.component.html',
  styleUrls: ['./admin-manage-users.component.scss']
})
export class AdminManageUsersComponent implements OnInit, OnDestroy {
  users: AppUser[] = [];
  filteredUsers: AppUser[] = [];
  loading = false;
  searchTerm = '';
  editing = false;
  editingUser: AppUser | null = null;
  showPassword = false;
  
  userForm: FormGroup;
  permissionsForm: FormGroup;
  
  displayedColumns: string[] = ['name', 'email', 'role', 'permissions', 'actions'];
  
  private destroy$ = new Subject<void>();

  constructor(
    private authService: AuthService,
    private userService: UserService,
    private fb: FormBuilder,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {
    this.userForm = this.createUserForm();
    this.permissionsForm = this.createPermissionsForm();
  }

  ngOnInit(): void {
    this.loadUsers();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private createUserForm(): FormGroup {
    return this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
      email: ['', [Validators.required, Validators.email, Validators.maxLength(100)]],
      role: ['user', Validators.required],
      temporaryPassword: [this.generateDefaultPassword(), [Validators.required, Validators.minLength(6), Validators.maxLength(50)]]
    });
  }

  private createPermissionsForm(): FormGroup {
    return this.fb.group({
      royal_nano_access: [false],
      royal_nano_overview: [false],
      royal_nano_messages: [false],
      royal_nano_services: [false],
      royal_nano_gallery: [false],
      royal_nano_blog: [false],
      royal_nano_reviews: [false],
      royal_nano_manage_users: [false],
      royal_nano_analytics: [false],
      royal_nano_landing_pages: [false],
      royal_shield_access: [false],
      royal_shield_serials: [false],
      royal_shield_requests: [false],
      royal_shield_activated_warrantys: [false]
    });
  }

  private loadUsers(): void {
    this.loading = true;
    this.userService.getAllUsers()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (users) => {
          this.users = users;
          this.filteredUsers = users;
          this.loading = false;
        },
        error: (error) => {
          console.error('Error loading users:', error);
          this.showError('خطأ في تحميل المستخدمين');
          this.loading = false;
        }
      });
  }

  searchUsers(): void {
    if (!this.searchTerm.trim()) {
      this.filteredUsers = this.users;
      return;
    }

    this.filteredUsers = this.users.filter(user =>
      user.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(this.searchTerm.toLowerCase())
    );
  }

  openCreateDialog(): void {
    console.log('🎯 Opening create user dialog');
    
    this.editing = true;
    this.editingUser = null;
    this.showPassword = false;
    this.loading = false; // Reset loading state
    
    // Reset forms with proper validation
    this.userForm.reset({
      role: 'user',
      temporaryPassword: this.generateDefaultPassword(),
      name: '',
      email: ''
    });
    
    // Set default permissions for new users (all false)
    this.permissionsForm.reset({
      royal_nano_access: false,
      royal_nano_overview: false,
      royal_nano_messages: false,
      royal_nano_services: false,
      royal_nano_gallery: false,
      royal_nano_blog: false,
      royal_nano_reviews: false,
      royal_nano_manage_users: false,
      royal_shield_access: false,
      royal_shield_serials: false,
      royal_shield_requests: false,
      royal_shield_activated_warrantys: false
    });
    
    console.log('✅ Dialog opened with default values');
  }

  /**
   * Generate a default password for new users
   */
  generateDefaultPassword(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    let password = '';
    for (let i = 0; i < 8; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
  }

  /**
   * Generate new password for the form
   */
  generateNewPassword(): void {
    const newPassword = this.generateDefaultPassword();
    this.userForm.patchValue({ temporaryPassword: newPassword });
  }

  /**
   * Toggle password visibility
   */
  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  openEditDialog(user: AppUser): void {
    console.log('✏️ Opening edit dialog for user:', user.name);
    
    this.editing = true;
    this.editingUser = user;
    this.showPassword = false;
    this.loading = false;
    
    this.userForm.patchValue({
      name: user.name,
      email: user.email,
      role: user.role
    });

    this.permissionsForm.patchValue({
      royal_nano_access: user.permissions.royal_nano?.access || false,
      royal_nano_overview: user.permissions.royal_nano?.overview || false,
      royal_nano_messages: user.permissions.royal_nano?.messages || false,
      royal_nano_services: user.permissions.royal_nano?.services || false,
      royal_nano_gallery: user.permissions.royal_nano?.gallery || false,
      royal_nano_blog: user.permissions.royal_nano?.blog || false,
      royal_nano_reviews: user.permissions.royal_nano?.reviews || false,
      royal_nano_manage_users: user.permissions.royal_nano?.manage_users || false,
      royal_shield_access: user.permissions.royal_shield?.access || false,
      royal_shield_serials: user.permissions.royal_shield?.serials || false,
      royal_shield_requests: user.permissions.royal_shield?.requests || false,
      royal_shield_activated_warrantys: user.permissions.royal_shield?.activated_warrantys || (user.permissions.royal_shield as any)?.warranties || false
    });
    
    console.log('✅ Edit dialog opened with user data');
  }

  closeDialog(): void {
    if (this.loading) return; // Prevent closing during loading
    
    this.editing = false;
    this.editingUser = null;
    this.showPassword = false;
    this.loading = false;
    this.userForm.reset();
    this.permissionsForm.reset();
  }

  saveUser(): void {
    // Validate forms
    if (this.userForm.invalid) {
      this.markFormGroupTouched(this.userForm);
      this.showError('يرجى ملء جميع الحقول المطلوبة بشكل صحيح');
      return;
    }

    if (this.permissionsForm.invalid) {
      this.markFormGroupTouched(this.permissionsForm);
      this.showError('يرجى تحديد الصلاحيات بشكل صحيح');
      return;
    }

    // Prevent double submission
    if (this.loading) return;

    this.loading = true;

    if (this.editingUser) {
      this.updateUser();
    } else {
      this.createUser();
    }
  }

  private createUser(): void {
    const userData = this.userForm.value;
    const permissions = this.buildPermissionsFromForm();

    console.log('📝 Creating user with data:', { 
      email: userData.email, 
      name: userData.name, 
      role: userData.role,
      permissions: permissions
    });

    // Validate that at least one permission is selected
    const hasAnyPermission = this.hasAnyPermissionSelected(permissions);
    if (!hasAnyPermission) {
      console.warn('⚠️ No permissions selected for user');
    }

    // Create user in Firebase Auth first, then in Firestore
    this.authService.createUser(
      userData.email,
      userData.temporaryPassword,
      userData.name,
      userData.role,
      permissions
    ).then((createdUser) => {
      console.log('✅ User created successfully:', createdUser);
      console.log('✅ Permissions saved:', createdUser.permissions);
      
      this.showSuccess(`تم إنشاء المستخدم ${userData.name} بنجاح! كلمة المرور المؤقتة: ${userData.temporaryPassword}`);
      
      // Refresh users list
      this.loadUsers();
      
      // Close dialog after a short delay to show success message
      setTimeout(() => {
        this.closeDialog();
      }, 1500);
      
    }).catch(error => {
      console.error('❌ Error creating user:', error);
      
      // Provide more specific error messages
      let errorMessage = 'خطأ في إنشاء المستخدم';
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = 'البريد الإلكتروني مستخدم بالفعل';
      } else if (error.code === 'auth/weak-password') {
        errorMessage = 'كلمة المرور ضعيفة جداً (يجب أن تكون 6 أحرف على الأقل)';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'البريد الإلكتروني غير صحيح';
      } else if (error.message) {
        errorMessage = `خطأ: ${error.message}`;
      }
      
      this.showError(errorMessage);
      this.loading = false;
    });
  }

  /**
   * Check if any permission is selected
   */
  private hasAnyPermissionSelected(permissions: UserPermissions): boolean {
    const nanoPerms = Object.values(permissions.royal_nano || {}).some(v => v === true);
    const shieldPerms = permissions.royal_shield ? 
      Object.values(permissions.royal_shield).some(v => v === true) : false;
    return nanoPerms || shieldPerms;
  }

  private updateUser(): void {
    if (!this.editingUser) {
      this.showError('خطأ: لم يتم العثور على المستخدم');
      this.loading = false;
      return;
    }

    const userData = this.userForm.value;
    const permissions = this.buildPermissionsFromForm();

    console.log('Updating user:', this.editingUser.uid, userData);

    // Update user data
    this.userService.updateUser(this.editingUser.uid, {
      name: userData.name,
      email: userData.email,
      role: userData.role,
      permissions: permissions
    }).pipe(takeUntil(this.destroy$))
    .subscribe({
      next: () => {
        console.log('User updated successfully');
        this.showSuccess('تم تحديث المستخدم بنجاح');
        this.loadUsers();
        
        // Close dialog after a short delay
        setTimeout(() => {
          this.closeDialog();
        }, 1000);
      },
      error: (error) => {
        console.error('Error updating user:', error);
        this.showError('خطأ في تحديث المستخدم');
        this.loading = false;
      }
    });
  }

  private buildPermissionsFromForm(): UserPermissions {
    const formValue = this.permissionsForm.value;
    
    console.log('🔧 Building permissions from form:', formValue);
    
    const permissions: UserPermissions = {
      royal_nano: {
        access: formValue.royal_nano_access || false,
        overview: formValue.royal_nano_overview || false,
        messages: formValue.royal_nano_messages || false,
        services: formValue.royal_nano_services || false,
        gallery: formValue.royal_nano_gallery || false,
        blog: formValue.royal_nano_blog || false,
        reviews: formValue.royal_nano_reviews || false,
        manage_users: formValue.royal_nano_manage_users || false,
        analytics: formValue.royal_nano_analytics || false,
        landing_pages: formValue.royal_nano_landing_pages || false
      },
      royal_shield: {
        access: formValue.royal_shield_access || false,
        serials: formValue.royal_shield_serials || false,
        requests: formValue.royal_shield_requests || false,
        activated_warrantys: formValue.royal_shield_activated_warrantys || false
      }
    };
    
    console.log('✅ Built permissions:', permissions);
    return permissions;
  }

  deleteUser(user: AppUser): void {
    if (confirm(`هل أنت متأكد من حذف المستخدم ${user.name}؟`)) {
      this.loading = true;
      
      this.userService.deleteUser(user.uid)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.showSuccess('تم حذف المستخدم بنجاح');
            this.loadUsers();
          },
          error: (error) => {
            console.error('Error deleting user:', error);
            this.showError('خطأ في حذف المستخدم');
          }
        });
    }
  }

  restoreUser(user: AppUser): void {
    this.loading = true;
    
    this.userService.restoreUser(user.uid)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.showSuccess('تم استعادة المستخدم بنجاح');
          this.loadUsers();
        },
        error: (error) => {
          console.error('Error restoring user:', error);
          this.showError('خطأ في استعادة المستخدم');
        }
      });
  }

  getPermissionSummary(user: AppUser): string {
    const summary = this.userService.getPermissionSummary(user.permissions);
    return summary.length > 0 ? summary.join(', ') : 'لا توجد صلاحيات';
  }

  getRoleDisplayName(role: string): string {
    return role === 'admin' ? 'مدير' : 'مستخدم';
  }

  getRoleColor(role: string): string {
    return role === 'admin' ? 'primary' : 'accent';
  }

  canManageUsers(): boolean {
    return this.authService.canManageUsers();
  }

  isCurrentUser(user: AppUser): boolean {
    const currentUser = this.authService.getCurrentUser();
    return currentUser?.uid === user.uid;
  }

  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsTouched();
    });
  }

  private showSuccess(message: string): void {
    this.snackBar.open(message, 'إغلاق', {
      duration: 3000,
      panelClass: ['success-snackbar']
    });
  }

  private showError(message: string): void {
    this.snackBar.open(message, 'إغلاق', {
      duration: 3000,
      panelClass: ['error-snackbar']
    });
  }
}
