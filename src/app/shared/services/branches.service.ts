import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable, Inject } from '@angular/core';
import { Observable, from } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { FirebaseAuthService } from './firebase-auth.service';

@Injectable({
  providedIn: 'root',
})
export class BranchesService {
  constructor(
    private http: HttpClient,
    @Inject(FirebaseAuthService) private firebaseAuth: FirebaseAuthService
  ) { }

  serverUrl: string = 'https://royal-shield-world.up.railway.app';

  async getToken(): Promise<string | null> {
    try {
      if (!this.firebaseAuth.getCurrentUser()) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      if (this.firebaseAuth.isLoggedIn()) {
        const token = await this.firebaseAuth.getFirebaseToken();
        if (token) {
          return token;
        }
      }
    } catch (e) {
      console.warn('⚠️ Could not get Firebase token');
    }

    return sessionStorage.getItem('authToken');
  }

  getBranches(): Observable<any> {
    return from(this.getToken()).pipe(
      switchMap(token => {
        const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
        return this.http.get(`${this.serverUrl}/api/admin/branches`, { headers });
      })
    );
  }

  addBranch(branch: any): Observable<any> {
    return from(this.getToken()).pipe(
      switchMap(token => {
        const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
        return this.http.post(`${this.serverUrl}/api/admin/branches`, branch, { headers });
      })
    );
  }

  updateBranch(id: string, branch: any): Observable<any> {
    return from(this.getToken()).pipe(
      switchMap(token => {
        const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
        return this.http.put(`${this.serverUrl}/api/admin/branches/${id}`, branch, { headers });
      })
    );
  }

  toggleBranchStatus(id: string, isActive: boolean): Observable<any> {
    return from(this.getToken()).pipe(
      switchMap(token => {
        const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
        return this.http.patch(`${this.serverUrl}/api/admin/branches/${id}/status`, { isActive }, { headers });
      })
    );
  }
}
