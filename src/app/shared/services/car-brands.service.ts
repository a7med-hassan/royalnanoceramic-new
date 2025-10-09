import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class CarBrandsService {
  private apiUrl = '/api/car-brands';
  
  // Local brands data as fallback
  private localBrands = [
    'Acura', 'Alfa Romeo', 'Arcfox', 'Aston Martin', 'Audi', 'Avatr', 'Baic', 'Bajaj',
    'Benelli', 'Bentley', 'Borgward', 'Brilliance', 'Bugatti', 'Buick', 'BYD', 'Cadillac',
    'Chana', 'Changan', 'Canghe', 'Chery', 'Chevrolet', 'Chrysler', 'Citroën', 'Cupra',
    'Daewoo', 'Daihatsu', 'Datsun', 'DFSK', 'Dodge', 'Dongfeng', 'Ds', 'Emgrand',
    'Exeed', 'Ferrari', 'Fiat', 'Ford', 'Foton', 'GAC', 'GMC', 'Geely', 'Genesis',
    'Great Wall', 'Hafei', 'Haima', 'Haval', 'Hummer', 'Hyundai', 'Ineos', 'Infiniti',
    'Isuzu', 'Jaguar', 'Jeep', 'Jetour', 'JMC', 'Kia', 'Koenigsegg', 'Lada',
    'Lamborghini', 'Land Rover', 'Lexus', 'Lincoln', 'Lotus', 'Lynk & Co', 'Mahindra',
    'Maserati', 'Mazda', 'Mercedes', 'MG', 'Mini', 'Mitsubishi', 'Nissan', 'Noble',
    'Opel', 'Peugeot', 'Porsche', 'Proton', 'Renault', 'Rolls Royce', 'Saab',
    'SsangYong', 'Subaru', 'Suzuki', 'Tesla', 'Toyota', 'Volkswagen', 'Volvo', 'Zotye'
  ];

  constructor(private http: HttpClient) {}

  searchBrands(query: string): Observable<string[]> {
    if (!query || query.length < 1) {
      return of([]);
    }

    // Try backend first, fallback to local data
    return this.http.get<string[]>(`${this.apiUrl}?q=${query}`).pipe(
      catchError(() => {
        // Fallback to local search
        const filtered = this.localBrands.filter(brand => 
          brand.toLowerCase().includes(query.toLowerCase())
        );
        return of(filtered);
      })
    );
  }
}

