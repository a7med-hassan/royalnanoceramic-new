import { Injectable, Inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class UploadService {
    private serverUrl = 'https://royal-shield-world.up.railway.app';
    // private serverUrl = environment.apiUrl; 

    constructor(private http: HttpClient) { }

    uploadImage(file: File, folder: string = 'nano'): Observable<any> {
        const formData = new FormData();
        formData.append('image', file);
        formData.append('folder', folder);

        // Note: Angular HttpClient automatically sets the Content-Type to multipart/form-data
        // when getting a FormData object, along with the correct boundary.
        // Do NOT manually set 'Content-Type': 'multipart/form-data'.

        return this.http.post(`${this.serverUrl}/api/upload`, formData);
    }
}
