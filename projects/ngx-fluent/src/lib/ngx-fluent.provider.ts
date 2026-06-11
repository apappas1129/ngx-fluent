import { EnvironmentProviders, inject, makeEnvironmentProviders, provideAppInitializer } from '@angular/core';
import { NgxFluentService } from './ngx-fluent.service';
import type { NgxFluentConfig } from './types';

/**
 * Registers ngx-fluent in an Angular standalone application.
 *
 * Add to the `providers` array of your `ApplicationConfig`:
 *
 * ```ts
 * export const appConfig: ApplicationConfig = {
 *   providers: [
 *     provideHttpClient(),
 *     provideNgxFluent({
 *       sources: {
 *         en: 'assets/i18n/en.ftl',
 *         sv: { path: 'assets/i18n/sv.ftl', bundleConfig: { useIsolating: false } },
 *       },
 *       defaultLocale: 'en',
 *     }),
 *   ],
 * };
 * ```
 *
 * **Why this is better than setting up in `ngOnInit`:**
 * When the setup is done inside a component's `ngOnInit`, Angular has already rendered the
 * initial view — so users see a flash of untranslated keys before the first locale loads.
 * `provideNgxFluent` hooks into Angular's application initializer phase: if `defaultLocale`
 * is specified, the HTTP fetch for that locale's `.ftl` file completes *before* the root
 * component is rendered, guaranteeing translated content on first paint.
 *
 * **`provideHttpClient()` prerequisite:**
 * ngx-fluent uses Angular's `HttpClient` to fetch `.ftl` files. Ensure `provideHttpClient()`
 * (or equivalent) is also in your providers. The library intentionally does not call it
 * internally so your application retains full control over interceptors and fetch configuration.
 */
export function provideNgxFluent(config: NgxFluentConfig): EnvironmentProviders {
  return makeEnvironmentProviders([
    provideAppInitializer((): Promise<void> | void => {
      const service = inject(NgxFluentService);
      service.setTranslationSourceMap(config.sources);
      if (config.defaultLocale) {
        return service.setLocale(config.defaultLocale);
      }
    }),
  ]);
}
