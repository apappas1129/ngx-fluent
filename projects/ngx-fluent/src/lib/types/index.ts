import { FluentBundle } from '@fluent/bundle';

type FluentBundleCtorConfig = NonNullable<ConstructorParameters<typeof FluentBundle>[1]>;

export interface TranslationSourceConfig {
  path: string;
  bundleConfig?: FluentBundleCtorConfig;
}

export type TranslationSourceMap = Record<string, string | TranslationSourceConfig | FluentBundle>;

export interface NgxFluentConfig {
  /**
   * Map of locale codes to translation sources.
   * Each value can be a URL string, a `{ path, bundleConfig }` object, or a pre-built `FluentBundle` instance.
   */
  sources: TranslationSourceMap;
  /**
   * Locale to activate during application initialization.
   * When provided, the app will not render until this locale's translation file is fetched —
   * ensuring no flash of untranslated content on first paint.
   * Omit to set the locale dynamically at runtime (e.g. from user preferences stored in localStorage).
   */
  defaultLocale?: string;
}
