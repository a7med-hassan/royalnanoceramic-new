import { Injectable } from '@angular/core';
import { PreloadingStrategy, Route } from '@angular/router';
import { Observable, of, timer } from 'rxjs';
import { mergeMap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class SelectivePreloadStrategy implements PreloadingStrategy {
  
  preload(route: Route, load: () => Observable<any>): Observable<any> {
    // Don't preload if data.preload is explicitly false
    if (route.data && route.data['preload'] === false) {
      console.log('⏭️ Skipping preload for:', route.path);
      return of(null);
    }

    // Preload with delay for non-critical routes
    if (route.data && route.data['delay']) {
      const delay = route.data['delay'];
      console.log(`⏳ Preloading with ${delay}ms delay:`, route.path);
      return timer(delay).pipe(
        mergeMap(() => {
          console.log('✅ Preloading:', route.path);
          return load();
        })
      );
    }

    // Immediate preload for critical routes
    if (route.data && route.data['preload']) {
      console.log('🚀 Preloading immediately:', route.path);
      return load();
    }

    // Default: preload after 2 seconds
    console.log('⏳ Default preload (2s):',route.path);
    return timer(2000).pipe(
      mergeMap(() => load())
    );
  }
}

