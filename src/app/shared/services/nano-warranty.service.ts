import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable, Inject } from '@angular/core';
import { Observable, from } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { FirebaseAuthService } from './firebase-auth.service';

@Injectable({
    providedIn: 'root',
})
export class NanoWarrantyService {
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

    activateWarranty(data: any, token: string): Observable<any> {
        const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
        return this.http.post(`${this.serverUrl}/api/nano-warranties/activate`, data, { headers });
    }

    checkStatus(phoneNumber: string, otp: string): Observable<any> {
        return this.http.post(`${this.serverUrl}/api/nano-warranties/check-status`, { phoneNumber, otp });
    }

    getNanoWarranties(): Observable<any> {
        return from(this.getToken()).pipe(
            switchMap(token => {
                const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
                return this.http.get(`${this.serverUrl}/api/nano-warranties`, { headers });
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
