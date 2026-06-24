import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable, Inject } from '@angular/core';
import { Observable, from } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { FirebaseAuthService } from './firebase-auth.service';

@Injectable({
  providedIn: 'root',
})
export class OffersService {
  constructor(
    private http: HttpClient,
    @Inject(FirebaseAuthService) private firebaseAuth: FirebaseAuthService
  ) { }

  private apiUrl = 'https://royal-shield-world.up.railway.app';

  async getToken(): Promise<string | null> {
    try {
      if (!this.firebaseAuth.getCurrentUser()) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      if (this.firebaseAuth.isLoggedIn()) {
        const token = await this.firebaseAuth.getFirebaseToken();
        if (token) {
          console.log('✅ Using Firebase token for offers');
          return token;
        }
      }
    } catch (e) {
      console.warn('⚠️ Could not get Firebase token, falling back to sessionStorage');
    }

    const sessionToken = sessionStorage.getItem('authToken');
    if (sessionToken) {
      console.log('✅ Using session token for offers');
    }
    return sessionToken;
  }

  // API ENDPOINTS FOR REQUESTS/OFFERS:
  getAllOffers(): Observable<any> {
    return from(this.getToken()).pipe(
      switchMap(token => {
        if (!token) {
          console.warn('⚠️ No token available for getAllOffers');
        }
        const headers = new HttpHeaders().set('Authorization', `Bearer ${token || ''}`);
        return this.http.get(`${this.apiUrl}/getOffers`, { headers });
      })
    );
  }

  checkOffer(id: string): Observable<any> {
    return from(this.getToken()).pipe(
      switchMap(token => {
        const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
        return this.http.post(`${this.apiUrl}/offerCheck`, {
          Id: id,
        }, { headers });
      })
    );
  }

  uncheckOffer(id: string): Observable<any> {
    return from(this.getToken()).pipe(
      switchMap(token => {
        const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
        return this.http.post(`${this.apiUrl}/offerUnCheck`, {
          Id: id,
        }, { headers });
      })
    );
  }

  deleteOffers(): Observable<any> {
    return from(this.getToken()).pipe(
      switchMap(token => {
        const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
        return this.http.delete(`${this.apiUrl}/deleteOffers`, { headers });
      })
    );
  }

  deleteOffer(id: string): Observable<any> {
    return from(this.getToken()).pipe(
      switchMap(token => {
        const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
        return this.http.delete(`${this.apiUrl}/offer/${id}`, { headers });
      })
    );
  }

  sendRequest(requestBody: any): Observable<any> {
    return from(this.getToken()).pipe(
      switchMap(token => {
        const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
        return this.http.post(`${this.apiUrl}/sendOffer`, requestBody, { headers });
      })
    );
  }

  sendEmail(requestBody: any): Observable<any> {
    return from(this.getToken()).pipe(
      switchMap(token => {
        const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
        return this.http.post(`${this.apiUrl}/send-email`, requestBody, { headers });
      })
    );
  }
}
