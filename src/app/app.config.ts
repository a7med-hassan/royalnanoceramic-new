import { ApplicationConfig, importProvidersFrom } from '@angular/core';
import {
  provideRouter,
  withViewTransitions,
  withInMemoryScrolling,
  withPreloading,
  PreloadAllModules,
} from '@angular/router';
import { provideAnimations } from '@angular/platform-browser/animations';
import {
  provideHttpClient,
  withInterceptors,
  withFetch,
} from '@angular/common/http';
import { ReactiveFormsModule } from '@angular/forms';

import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(
      routes,
      withViewTransitions(),
      withInMemoryScrolling({ scrollPositionRestoration: 'top' }),
      withPreloading(PreloadAllModules)
    ),
    provideAnimations(),
    provideHttpClient(
      withInterceptors([]),
      withFetch() // Use fetch API for better performance
    ),
    importProvidersFrom(ReactiveFormsModule),
  ],
};
