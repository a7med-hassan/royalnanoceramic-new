import { Injectable } from '@angular/core';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root',
})
export class FirebaseAuthService {
  constructor(private authService: AuthService) {}

  /**
   * Get current user
   */
  getCurrentUser(): any {
    return this.authService.getCurrentUser();
  }

  /**
   * Check if user is logged in
   */
  isLoggedIn(): boolean {
    return this.authService.isLoggedIn();
  }

  /**
   * Get Firebase token
   */
  async getFirebaseToken(): Promise<string> {
    return await this.authService.getFirebaseToken();
  }
}
