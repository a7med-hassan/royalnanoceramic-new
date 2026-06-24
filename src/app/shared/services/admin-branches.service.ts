import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class AdminBranchesService {
    private apiUrl = `${environment.apiUrl}/admin/branches`;

    constructor(private http: HttpClient) { }

    private getHeaders(): HttpHeaders {
        const token = sessionStorage.getItem('authToken');
        return new HttpHeaders().set('Authorization', `Bearer ${token}`);
    }

    getBranches(): Observable<any> {
        return this.http.get(this.apiUrl, { headers: this.getHeaders() });
    }

    createBranch(branch: any): Observable<any> {
        return this.http.post(this.apiUrl, branch, { headers: this.getHeaders() });
    }

    updateBranch(id: string, branch: any): Observable<any> {
        return this.http.put(`${this.apiUrl}/${id}`, branch, { headers: this.getHeaders() });
    }

    toggleBranchStatus(id: string, isActive: boolean): Observable<any> {
        return this.http.patch(`${this.apiUrl}/${id}/status`, { isActive }, { headers: this.getHeaders() });
    }
}
