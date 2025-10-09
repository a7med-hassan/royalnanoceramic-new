import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { appConfig } from './app/app.config';
import { enableProdMode } from '@angular/core';
import { environment } from './environments/environment';
import '@angular/localize/init';


// Enable production mode
if (environment.production) {
  enableProdMode();
}

// Performance optimizations
if ('serviceWorker' in navigator && environment.production) {
  window.addEventListener('load', () => {
    // Register Angular Service Worker
    navigator.serviceWorker
      .register('/ngsw-worker.js')
      .then((registration) => {
        console.log('Angular SW registered: ', registration);
        
        // Also register custom service worker for navigation preload
        return navigator.serviceWorker.register('/custom-sw.js');
      })
      .then((registration) => {
        console.log('Custom SW registered: ', registration);
      })
      .catch((registrationError) => {
        console.log('SW registration failed: ', registrationError);
      });
  });
}

bootstrapApplication(AppComponent, appConfig).catch((err) =>
  console.error(err)
);

