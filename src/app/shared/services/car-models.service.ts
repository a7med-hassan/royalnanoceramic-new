import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class CarModelsService {
  private apiUrl = '/api/car-models';
  
  // Local models data as fallback
  private localModels: { [brand: string]: string[] } = {
    'تويوتا': ['كامري', 'كورولا', 'RAV4', 'هايلكس', 'لاند كروزر', 'برادو', 'يارس', 'أفالون', 'سي-إتش آر', 'فورتشنر'],
    'مرسيدس': ['C-Class', 'E-Class', 'S-Class', 'A-Class', 'GLE', 'GLC', 'GLS', 'CLA', 'CLS', 'AMG GT'],
    'BMW': ['3 Series', '5 Series', '7 Series', 'X1', 'X3', 'X5', 'X7', 'Z4', 'i3', 'i8'],
    'أودي': ['A3', 'A4', 'A6', 'A8', 'Q3', 'Q5', 'Q7', 'Q8', 'TT', 'R8'],
    'فولكس فاجن': ['جولف', 'باسات', 'تيغوان', 'توارق', 'جيتا', 'بولو', 'أرتيون', 'أطلس'],
    'هيونداي': ['إلنترا', 'سوناتا', 'توسان', 'سانتا في', 'أكسنت', 'فيرنا', 'إيونيك', 'كونا'],
    'كيا': ['سيراتو', 'أوبتيما', 'سبورتاج', 'سورينتو', 'بيكانتو', 'سول', 'ستينجر', 'نيرو'],
    'نيسان': ['صني', 'التيما', 'إكس-تريل', 'باترول', 'جوك', 'كيكس', 'ليف', 'ماكسيما'],
    'هوندا': ['سيفيك', 'أكورد', 'CR-V', 'HR-V', 'باسات', 'فيت', 'إنسايت', 'أوديسي'],
    'مازدا': ['مازدا3', 'مازدا6', 'CX-3', 'CX-5', 'CX-9', 'MX-5', 'RX-8', 'تريبوتي'],
    'فورد': ['فوكس', 'فوكس', 'إسكيب', 'إكسبلورر', 'إيدج', 'فليكس', 'إكسبيديشن', 'F-150'],
    'شيفروليه': ['كروز', 'ماليبو', 'إكوينوكس', 'ترافيرس', 'تاهو', 'سيلفرادو', 'كورفيت', 'كامارو'],
    'بيجو': ['208', '308', '508', '2008', '3008', '5008', 'ريفتر', 'بارتنر'],
    'رينو': ['ميجان', 'كليو', 'تاليسمان', 'كابتشر', 'كولوس', 'كادجار', 'لوجان', 'سانديرو']
  };

  constructor(private http: HttpClient) {}

  searchModels(brand: string, query: string): Observable<string[]> {
    if (!query || query.length < 1 || !brand) {
      return of([]);
    }

    // Try backend first, fallback to local data
    return this.http.get<string[]>(`${this.apiUrl}?brand=${brand}&q=${query}`).pipe(
      catchError(() => {
        // Fallback to local search
        const brandModels = this.localModels[brand] || [];
        const filtered = brandModels.filter(model => 
          model.toLowerCase().includes(query.toLowerCase())
        );
        return of(filtered);
      })
    );
  }
}

