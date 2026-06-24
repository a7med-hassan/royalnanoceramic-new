import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class BranchOtpService {
    constructor(private http: HttpClient) { }

    serverUrl: string = 'https://royal-shield-world.up.railway.app';

    requestOtp(branchCode: string): Observable<any> {
        return this.http.post(`${this.serverUrl}/api/branch-otp/request`, { branchCode });
    }

    verifyOtp(requestId: string, otp: string): Observable<any> {
        return this.http.post(`${this.serverUrl}/api/branch-otp/verify`, { requestId, otp });
    }
}
