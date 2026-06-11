import { ApplicationConfig, provideBrowserGlobalErrorListeners, provideZoneChangeDetection } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';
import { provideNgxFluent } from '@zeferinix/ngx-fluent';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection({ eventCoalescing: true }),
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
