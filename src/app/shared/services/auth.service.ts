import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { 
  Auth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  User,
  onAuthStateChanged,
  sendPasswordResetEmail
} from '@angular/fire/auth';
import { 
  Firestore, 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  collection, 
  query, 
  where, 
  getDocs,
  Timestamp 
} from '@angular/fire/firestore';
import { BehaviorSubject, Observable, from, of } from 'rxjs';
import { map, switchMap, catchError } from 'rxjs/operators';

export interface UserPermissions {
  royal_nano: {
    access: boolean;
    overview: boolean;
    messages: boolean;
    services: boolean;
    gallery: boolean;
    blog: boolean;
    reviews: boolean;
    manage_users?: boolean;
    analytics?: boolean;
    landing_pages?: boolean;
  };
  royal_shield?: {
    access: boolean;
    serials: boolean;
    requests: boolean;
    activated_warrantys: boolean;
  };
  [key: string]: any;
}

export interface AppUser {
  uid: string;
  email: string;
  name: string;
  role: 'admin' | 'user';
  permissions: UserPermissions;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  deleted?: boolean;
  deletedAt?: Timestamp;
  token?: string; // JWT token for API requests
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private userSubject = new BehaviorSubject<AppUser | null>(null);
  public user$ = this.userSubject.asObservable();
  
  private readonly STORAGE_KEY = 'auth-user';
  private readonly TOKEN_KEY = 'auth-token';
  private isInitialized = false;

  constructor(
    private auth: Auth,
    private firestore: Firestore,
    private router: Router
  ) {
    this.initializeAuth();
  }

  private initializeAuth(): void {
    // First, try to restore user from localStorage for immediate UI update
    this.loadFromStorage();
    this.isInitialized = true;
    
    // Then listen to Firebase Auth state changes
    onAuthStateChanged(this.auth, async (user) => {
      console.log('🔥 Firebase Auth state changed:', user ? `User: ${user.email}` : 'No user');
      
      if (user) {
        try {
          const appUser = await this.getUserData(user.uid);
          if (appUser) {
            // Get fresh Firebase token and add it to userData
            const firebaseToken = await user.getIdToken();
            const appUserWithToken = {
              ...appUser,
              token: firebaseToken
            };
            
            console.log('✅ User authenticated successfully:', appUser.email);
            this.userSubject.next(appUserWithToken);
            this.saveToStorage(appUserWithToken);
          } else {
            // User exists in Firebase Auth but not in Firestore
            console.warn('⚠️ User not found in Firestore, signing out');
            await this.signOut();
          }
        } catch (error) {
          console.error('❌ Error fetching user data:', error);
          await this.signOut();
        }
      } else {
        console.log('👋 User signed out (or initializing)');
        // Commented out to prevent aggressive logouts on refresh
        // this.userSubject.next(null);
        // this.clearStorage();
      }
    });
  }

  /**
   * Login with email and password
   */
  async login(email: string, password: string): Promise<AppUser> {
    try {
      const userCredential = await signInWithEmailAndPassword(this.auth, email, password);
      const userData = await this.getUserData(userCredential.user.uid);
      
      if (!userData) {
        console.error('User data not found in Firestore for UID:', userCredential.user.uid);
        // Sign out the user since they don't have proper data
        await signOut(this.auth);
        throw new Error('بيانات المستخدم غير موجودة في النظام. يرجى التواصل مع المدير.');
      }

      // Get Firebase Auth token and add it to userData
      const firebaseToken = await userCredential.user.getIdToken();
      const userDataWithToken = {
        ...userData,
        token: firebaseToken
      };

      this.userSubject.next(userDataWithToken);
      this.saveToStorage(userDataWithToken);
      return userDataWithToken;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  /**
   * Create new user account
   */
  async createUser(
    email: string, 
    password: string, 
    name: string, 
    role: 'admin' | 'user' = 'user',
    permissions?: UserPermissions
  ): Promise<AppUser> {
    try {
      const userCredential = await createUserWithEmailAndPassword(this.auth, email, password);
      const uid = userCredential.user.uid;
      
      const defaultPermissions: UserPermissions = permissions || {
        royal_nano: {
          access: role === 'admin',
          overview: role === 'admin',
          messages: role === 'admin',
          services: role === 'admin',
          gallery: role === 'admin',
          blog: role === 'admin',
          reviews: role === 'admin',
          manage_users: role === 'admin',
          analytics: role === 'admin',
          landing_pages: role === 'admin'
        },
        royal_shield: {
          access: role === 'admin',
          serials: role === 'admin',
          requests: role === 'admin',
          activated_warrantys: role === 'admin'
        }
      };

      const userData: AppUser = {
        uid,
        email,
        name,
        role,
        permissions: defaultPermissions,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      };

      await setDoc(doc(this.firestore, 'users', uid), userData);
      
      this.userSubject.next(userData);
      this.saveToStorage(userData);
      return userData;
    } catch (error) {
      console.error('Create user error:', error);
      throw error;
    }
  }

  /**
   * Get user data from Firestore
   */
  private async getUserData(uid: string): Promise<AppUser | null> {
    try {
      const userDoc = await getDoc(doc(this.firestore, 'users', uid));
      if (userDoc.exists()) {
        return userDoc.data() as AppUser;
      }
      return null;
    } catch (error) {
      console.error('Error getting user data:', error);
      return null;
    }
  }

  /**
   * Get user data by email
   */
  async getUserByEmail(email: string): Promise<AppUser | null> {
    try {
      const q = query(
        collection(this.firestore, 'users'),
        where('email', '==', email)
      );
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        const doc = querySnapshot.docs[0];
        return doc.data() as AppUser;
      }
      return null;
    } catch (error) {
      console.error('Error getting user by email:', error);
      return null;
    }
  }

  /**
   * Update user permissions
   */
  async updateUserPermissions(uid: string, permissions: UserPermissions): Promise<void> {
    try {
      const userRef = doc(this.firestore, 'users', uid);
      await updateDoc(userRef, {
        permissions,
        updatedAt: Timestamp.now()
      });

      // Update current user if it's the same user
      const currentUser = this.userSubject.value;
      if (currentUser && currentUser.uid === uid) {
        const updatedUser = { ...currentUser, permissions };
        this.userSubject.next(updatedUser);
        this.saveToStorage(updatedUser);
      }
    } catch (error) {
      console.error('Error updating user permissions:', error);
      throw error;
    }
  }

  /**
   * Update user role
   */
  async updateUserRole(uid: string, role: 'admin' | 'user'): Promise<void> {
    try {
      const userRef = doc(this.firestore, 'users', uid);
      await updateDoc(userRef, {
        role,
        updatedAt: Timestamp.now()
      });

      // Update current user if it's the same user
      const currentUser = this.userSubject.value;
      if (currentUser && currentUser.uid === uid) {
        const updatedUser = { ...currentUser, role };
        this.userSubject.next(updatedUser);
        this.saveToStorage(updatedUser);
      }
    } catch (error) {
      console.error('Error updating user role:', error);
      throw error;
    }
  }

  /**
   * Sign out
   */
  async signOut(): Promise<void> {
    try {
      await signOut(this.auth);
      this.userSubject.next(null);
      this.clearStorage();
      this.router.navigate(['/admin']);
    } catch (error) {
      console.error('Sign out error:', error);
      throw error;
    }
  }

  /**
   * Reset password
   */
  async resetPassword(email: string): Promise<void> {
    try {
      await sendPasswordResetEmail(this.auth, email);
    } catch (error) {
      console.error('Reset password error:', error);
      throw error;
    }
  }

  /**
   * Check if user is logged in
   */
  isLoggedIn(): boolean {
    // If not initialized yet, check localStorage directly
    if (!this.isInitialized) {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        try {
          const user = JSON.parse(stored) as AppUser;
          return user && user.email && user.uid ? true : false;
        } catch (error) {
          console.error('❌ Error parsing stored user in isLoggedIn:', error);
          return false;
        }
      }
      return false;
    }
    
    const currentUser = this.userSubject.value;
    return currentUser !== null && !!currentUser.email && !!currentUser.uid;
  }

  /**
   * Get current user
   */
  getCurrentUser(): AppUser | null {
    // If not initialized yet, try to get from localStorage
    if (!this.isInitialized) {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        try {
          const user = JSON.parse(stored) as AppUser;
          return user && user.email && user.uid ? user : null;
        } catch (error) {
          console.error('❌ Error parsing stored user in getCurrentUser:', error);
          return null;
        }
      }
      return null;
    }
    
    const currentUser = this.userSubject.value;
    return currentUser && currentUser.email && currentUser.uid ? currentUser : null;
  }

  /**
   * Get Firebase Auth token
   */
  async getFirebaseToken(): Promise<string> {
    try {
      const user = this.auth.currentUser;
      if (!user) {
        console.error('❌ No user logged in');
        throw new Error("No user logged in");
      }
      
      console.log('🔑 Getting Firebase token for user:', user.email);
      const token = await user.getIdToken();
      console.log('✅ Firebase token retrieved successfully');
      return token;
    } catch (error) {
      console.error('❌ Error getting Firebase token:', error);
      throw error;
    }
  }

  /**
   * Get current user's token (from currentUser or get fresh one)
   */
  async getCurrentUserToken(): Promise<string | null> {
    const currentUser = this.getCurrentUser();
    if (currentUser?.token) {
      return currentUser.token;
    }
    
    // If no token in currentUser, get fresh one
    return await this.getFirebaseToken();
  }

  /**
   * Check if user has site access
   */
  hasSiteAccess(siteKey: string): boolean {
    const user = this.getCurrentUser();
    return user?.permissions?.[siteKey]?.access === true;
  }

  /**
   * Check if user has specific permission
   */
  hasPermission(siteKey: string, permission: string): boolean {
    const user = this.getCurrentUser();
    if (!user?.permissions?.[siteKey]) {
      return false;
    }
    
    const sitePermissions = user.permissions[siteKey];
    
    // Check direct permission
    if (sitePermissions[permission] === true) {
      return true;
    }
    
    // Backward compatibility: Check for activated_warrantys when requesting warranties
    if (siteKey === 'royal_shield' && permission === 'activated_warrantys') {
      return (sitePermissions as any).warranties === true || sitePermissions.activated_warrantys === true;
    }
    
    // Backward compatibility: Check for warranties when requesting activated_warrantys
    if (siteKey === 'royal_shield' && permission === 'warranties') {
      return (sitePermissions as any).warranties === true || sitePermissions.activated_warrantys === true;
    }
    
    return false;
  }

  /**
   * Check if user is admin
   */
  isAdmin(): boolean {
    const user = this.getCurrentUser();
    return user?.role === 'admin';
  }

  /**
   * Check if user can manage users
   */
  canManageUsers(): boolean {
    const user = this.getCurrentUser();
    return user?.role === 'admin' || user?.permissions?.royal_nano?.manage_users === true;
  }

  /**
   * Validate access and redirect if unauthorized
   */
  validateAccess(): boolean {
    if (!this.isLoggedIn()) {
      this.router.navigate(['/admin']);
      return false;
    }
    return true;
  }

  /**
   * Validate admin access
   */
  validateAdminAccess(): boolean {
    if (!this.isAdmin()) {
      this.router.navigate(['/admin/dashboard']);
      return false;
    }
    return true;
  }

  /**
   * Save user data to localStorage
   */
  private saveToStorage(user: AppUser): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(user));
    } catch (error) {
      console.error('Error saving to storage:', error);
    }
  }

  /**
   * Clear localStorage
   */
  private clearStorage(): void {
    localStorage.removeItem(this.STORAGE_KEY);
    localStorage.removeItem(this.TOKEN_KEY);
  }

  /**
   * Load user from localStorage (fallback)
   */
  loadFromStorage(): void {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      console.log('🔍 AuthService: Checking localStorage for user data:', stored ? 'Found data' : 'No data');
      
      if (stored) {
        const user = JSON.parse(stored) as AppUser;
        
        // Validate the stored user data
        if (!user || !user.email || !user.uid) {
          console.warn('⚠️ Invalid user data in storage, but keeping it just in case');
          // this.clearStorage();
          // return;
        }
        
        // Check if the stored user data is not too old (optional: 24 hours)
        const now = new Date().getTime();
        let storedTime = 0;
        
        if (user.updatedAt) {
          storedTime = typeof user.updatedAt.toMillis === 'function' 
            ? user.updatedAt.toMillis() 
            : ((user.updatedAt as any).seconds * 1000) || 0;
        } else if (user.createdAt) {
          storedTime = typeof user.createdAt.toMillis === 'function' 
            ? user.createdAt.toMillis() 
            : ((user.createdAt as any).seconds * 1000) || 0;
        }

        const hoursDiff = storedTime > 0 ? (now - storedTime) / (1000 * 60 * 60) : 0;
        
        // If data is older than 24 hours, don't restore it
        if (storedTime > 0 && hoursDiff > 24) {
          console.log('⏰ Stored user data is too old, but keeping it to prevent sudden logouts');
          // this.clearStorage();
          // return;
        }
        
        console.log('✅ Restoring user from localStorage:', user.email);
        this.userSubject.next(user);
      } else {
        console.log('ℹ️ No user data found in localStorage');
      }
    } catch (error) {
      console.error('❌ Error loading from storage:', error);
      this.clearStorage();
    }
  }

  /**
   * Get all users (admin only)
   */
  async getAllUsers(): Promise<AppUser[]> {
    try {
      const q = query(collection(this.firestore, 'users'));
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => doc.data() as AppUser);
    } catch (error) {
      console.error('Error getting all users:', error);
      throw error;
    }
  }

  /**
   * Delete user
   */
  async deleteUser(uid: string): Promise<void> {
    try {
      const userRef = doc(this.firestore, 'users', uid);
      await updateDoc(userRef, {
        deleted: true,
        updatedAt: Timestamp.now()
      });
    } catch (error) {
      console.error('Error deleting user:', error);
      throw error;
    }
  }
}
