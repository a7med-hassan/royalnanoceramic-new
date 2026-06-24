import { Injectable } from '@angular/core';
import { 
  Firestore, 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  setDoc, 
  updateDoc, 
  deleteDoc,
  query, 
  where,
  orderBy,
  limit,
  Timestamp 
} from '@angular/fire/firestore';
import { Observable, from, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { AppUser, UserPermissions } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  constructor(private firestore: Firestore) {}

  /**
   * Get all users
   */
  getAllUsers(): Observable<AppUser[]> {
    return from(
      getDocs(collection(this.firestore, 'users'))
    ).pipe(
      map(snapshot => 
        snapshot.docs
          .map(doc => ({ id: doc.id, ...doc.data() } as AppUser & { id: string }))
          .filter(user => !user.deleted)
      ),
      catchError(error => {
        console.error('Error getting all users:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Get user by ID
   */
  getUserById(uid: string): Observable<AppUser | null> {
    return from(
      getDoc(doc(this.firestore, 'users', uid))
    ).pipe(
      map(docSnapshot => {
        if (docSnapshot.exists()) {
          return docSnapshot.data() as AppUser;
        }
        return null;
      }),
      catchError(error => {
        console.error('Error getting user by ID:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Get user by email
   */
  getUserByEmail(email: string): Observable<AppUser | null> {
    const q = query(
      collection(this.firestore, 'users'),
      where('email', '==', email)
    );

    return from(getDocs(q)).pipe(
      map(querySnapshot => {
        if (!querySnapshot.empty) {
          return querySnapshot.docs[0].data() as AppUser;
        }
        return null;
      }),
      catchError(error => {
        console.error('Error getting user by email:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Create new user
   */
  createUser(userData: Partial<AppUser>): Observable<string> {
    const userRef = doc(collection(this.firestore, 'users'));
    const now = Timestamp.now();

    const newUser: AppUser = {
      uid: userRef.id,
      email: userData.email || '',
      name: userData.name || '',
      role: userData.role || 'user',
      permissions: userData.permissions || this.getDefaultPermissions(),
      createdAt: now,
      updatedAt: now
    };

    return from(setDoc(userRef, newUser)).pipe(
      map(() => userRef.id),
      catchError(error => {
        console.error('Error creating user:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Update user
   */
  updateUser(uid: string, updateData: Partial<AppUser>): Observable<void> {
    const userRef = doc(this.firestore, 'users', uid);
    
    const updatePayload = {
      ...updateData,
      updatedAt: Timestamp.now()
    };

    return from(updateDoc(userRef, updatePayload)).pipe(
      catchError(error => {
        console.error('Error updating user:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Update user permissions
   */
  updateUserPermissions(uid: string, permissions: UserPermissions): Observable<void> {
    return this.updateUser(uid, { permissions });
  }

  /**
   * Update user role
   */
  updateUserRole(uid: string, role: 'admin' | 'user'): Observable<void> {
    return this.updateUser(uid, { role });
  }

  /**
   * Soft delete user (mark as deleted)
   */
  deleteUser(uid: string): Observable<void> {
    return this.updateUser(uid, { 
      deleted: true,
      deletedAt: Timestamp.now()
    });
  }

  /**
   * Hard delete user (permanent removal)
   */
  permanentlyDeleteUser(uid: string): Observable<void> {
    return from(deleteDoc(doc(this.firestore, 'users', uid))).pipe(
      catchError(error => {
        console.error('Error permanently deleting user:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Restore deleted user
   */
  restoreUser(uid: string): Observable<void> {
    return this.updateUser(uid, { 
      deleted: false
    });
  }

  /**
   * Get users by role
   */
  getUsersByRole(role: 'admin' | 'user'): Observable<AppUser[]> {
    const q = query(
      collection(this.firestore, 'users'),
      where('role', '==', role),
      where('deleted', '==', false)
    );

    return from(getDocs(q)).pipe(
      map(snapshot => 
        snapshot.docs.map(doc => doc.data() as AppUser)
      ),
      catchError(error => {
        console.error('Error getting users by role:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Search users by name or email
   */
  searchUsers(searchTerm: string): Observable<AppUser[]> {
    // Note: Firestore doesn't support full-text search natively
    // This is a basic implementation. For production, consider using Algolia or similar
    return this.getAllUsers().pipe(
      map(users => 
        users.filter(user => 
          user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.email.toLowerCase().includes(searchTerm.toLowerCase())
        )
      )
    );
  }

  /**
   * Get user statistics
   */
  getUserStats(): Observable<{
    total: number;
    admins: number;
    users: number;
    active: number;
  }> {
    return this.getAllUsers().pipe(
      map(users => {
        const stats = {
          total: users.length,
          admins: users.filter(u => u.role === 'admin').length,
          users: users.filter(u => u.role === 'user').length,
          active: users.filter(u => !u.deleted).length
        };
        return stats;
      })
    );
  }

  /**
   * Get default permissions for new users
   */
  private getDefaultPermissions(): UserPermissions {
    return {
      royal_nano: {
        access: false,
        overview: false,
        messages: false,
        services: false,
        gallery: false,
        blog: false,
        reviews: false,
        manage_users: false
      },
      royal_shield: {
        access: false,
        serials: false,
        requests: false,
        activated_warrantys: false
      }
    };
  }

  /**
   * Get admin permissions template
   */
  getAdminPermissions(): UserPermissions {
    return {
      royal_nano: {
        access: true,
        overview: true,
        messages: true,
        services: true,
        gallery: true,
        blog: true,
        reviews: true,
        manage_users: true
      },
      royal_shield: {
        access: true,
        serials: true,
        requests: true,
        activated_warrantys: true
      }
    };
  }

  /**
   * Get user permissions template
   */
  getUserPermissions(): UserPermissions {
    return {
      royal_nano: {
        access: true,
        overview: false,
        messages: false,
        services: false,
        gallery: false,
        blog: false,
        reviews: false,
        manage_users: false,
        analytics: false,
        landing_pages: false
      }
    };
  }

  /**
   * Validate user permissions structure
   */
  validatePermissions(permissions: any): boolean {
    try {
      // Check if permissions have the required structure
      const requiredSites = ['royal_nano'];
      const requiredPermissions = ['access', 'overview', 'messages', 'services', 'gallery', 'blog', 'reviews'];

      for (const site of requiredSites) {
        if (!permissions[site]) return false;
        
        for (const perm of requiredPermissions) {
          if (typeof permissions[site][perm] !== 'boolean') return false;
        }
      }

      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Clone permissions from another user
   */
  clonePermissionsFromUser(sourceUser: AppUser): UserPermissions {
    return JSON.parse(JSON.stringify(sourceUser.permissions));
  }

  /**
   * Get permission summary for display
   */
  getPermissionSummary(permissions: UserPermissions): string[] {
    const summary: string[] = [];

    if (permissions.royal_nano?.access) {
      summary.push('Royal Nano Access');
      
      const nanoPerms = [];
      if (permissions.royal_nano.overview) nanoPerms.push('Overview');
      if (permissions.royal_nano.messages) nanoPerms.push('Messages');
      if (permissions.royal_nano.services) nanoPerms.push('Services');
      if (permissions.royal_nano.gallery) nanoPerms.push('Gallery');
      if (permissions.royal_nano.blog) nanoPerms.push('Blog');
      if (permissions.royal_nano.reviews) nanoPerms.push('Reviews');
      if (permissions.royal_nano.manage_users) nanoPerms.push('Manage Users');

      if (nanoPerms.length > 0) {
        summary.push(`- ${nanoPerms.join(', ')}`);
      }
    }

    if (permissions.royal_shield?.access) {
      summary.push('Royal Shield Access');
      
      const shieldPerms = [];
      if (permissions.royal_shield.serials) shieldPerms.push('Serials');
      if (permissions.royal_shield.requests) shieldPerms.push('Requests');
      if (permissions.royal_shield.activated_warrantys || (permissions.royal_shield as any).warranties) shieldPerms.push('Activated Warranties');

      if (shieldPerms.length > 0) {
        summary.push(`- ${shieldPerms.join(', ')}`);
      }
    }

    return summary;
  }
}
