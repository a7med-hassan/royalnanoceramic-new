import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { appConfig } from './app/app.config';
import { enableProdMode } from '@angular/core';
import { environment } from './environments/environment';

// Enable production mode
if (environment.production) {
  enableProdMode();
}

// Performance optimizations
if ('serviceWorker' in navigator && environment.production) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/ngsw-worker.js')
      .then((registration) => {
        console.log('SW registered: ', registration);
      })
      .catch((registrationError) => {
        console.log('SW registration failed: ', registrationError);
      });
  });
}

bootstrapApplication(AppComponent, appConfig).catch((err) =>
  console.error(err)
);
