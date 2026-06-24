import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable, Inject } from '@angular/core';
import { Observable, from } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { FirebaseAuthService } from './firebase-auth.service';

@Injectable({
  providedIn: 'root',
})
export class SerialService {
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
          console.log('✅ Using Firebase token for serials');
          return token;
        }
      }
    } catch (e) {
      console.warn('⚠️ Could not get Firebase token, falling back to sessionStorage');
    }

    const sessionToken = sessionStorage.getItem('authToken');
    if (sessionToken) {
      console.log('✅ Using session token for serials');
    }
    return sessionToken;
  }

  // API ENDPOINTS FOR SERIALS:
  getSerials(): Observable<any> {
    return from(this.getToken()).pipe(
      switchMap(token => {
        const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
        return this.http.get(`${this.serverUrl}/viewSerials`, { headers });
      })
    );
  }

  addSerial(serial: {
    productCode: string;
    internalSerial: string;
    branch: string;
    serialNumber?: string; // Optional for backward compatibility
  }): Observable<any> {
    return from(this.getToken()).pipe(
      switchMap(token => {
        const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
        return this.http.post(`${this.serverUrl}/addSerial`, serial, { headers });
      })
    );
  }

  updateBranch(serial: {
    serialNumber: string;
    branch: string;
  }): Observable<any> {
    return from(this.getToken()).pipe(
      switchMap(token => {
        const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
        return this.http.post(`${this.serverUrl}/updateBranch`, serial, { headers });
      })
    );
  }

  deleteSerial(serial: string): Observable<any> {
    return from(this.getToken()).pipe(
      switchMap(token => {
        const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
        return this.http.post(`${this.serverUrl}/deleteSerial`, {
          serialNumber: serial,
        }, { headers });
      })
    );
  }

  serialCheck(serial: any): Observable<any> {
    return from(this.getToken()).pipe(
      switchMap(token => {
        const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
        return this.http.post(`${this.serverUrl}/checkSerial`, serial, { headers });
      })
    );
  }

  warrantyActivation(warrantyForm: any): Observable<any> {
    return from(this.getToken()).pipe(
      switchMap(token => {
        const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
        return this.http.post(`${this.serverUrl}/activation`, warrantyForm, { headers });
      })
    );
  }

  getActivatedWarrantys(): Observable<any> {
    return from(this.getToken()).pipe(
      switchMap(token => {
        const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
        return this.http.get(`${this.serverUrl}/activatedWarrantys`, { headers });
      })
    );
  }

  getNanoWarranties(): Observable<any> {
    return from(this.getToken()).pipe(
      switchMap(token => {
        const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
        return this.http.get(`${this.serverUrl}/api/nano-warranties`, { headers });
      })
    );
  }

  deleteActivation(serial: string): Observable<any> {
    return from(this.getToken()).pipe(
      switchMap(token => {
        const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
        return this.http.delete(`${this.serverUrl}/activation/${serial}`, { headers });
      })
    );
  }

  deleteNanoWarranty(id: string): Observable<any> {
    return from(this.getToken()).pipe(
      switchMap(token => {
        const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
        return this.http.delete(`${this.serverUrl}/api/nano-warranties/${id}`, { headers });
      })
    );
  }
}
