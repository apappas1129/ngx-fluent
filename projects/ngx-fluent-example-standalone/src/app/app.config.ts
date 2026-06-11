import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';
import { provideNgxFluent } from '@zeferinix/ngx-fluent';

// Angular 22 new projects are zoneless by default — no zone.js polyfill, no provideZoneChangeDetection.
// provideBrowserGlobalErrorListeners() registers Angular's global error and rejection handlers.
export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideHttpClient(),
    provideNgxFluent({
      sources: {
        en: 'i18n/en.ftl',
        sv: 'i18n/sv.ftl',
      },
      defaultLocale: 'en',
    }),
  ],
};
