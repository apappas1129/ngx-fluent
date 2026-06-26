# ngx-fluent

An [Angular](https://angular.io/) library for [Fluent](https://projectfluent.org/).

## Angular compatibility

Latest version available for each version of Angular

 | @apappas1129/ngx-fluent | Angular | @fluent/bundle |
 | --------------------- | ------- | -------------- |
 | >= 1.0                | 13.x    | < 1.x          |
 | >= 1.1                | 14.x    | < 1.x          |
 | >= 1.2                | 15.x    | < 1.x          |
 | >= 2.0                | 16.x    | < 1.x          |
 | >= 3.0                | 17.x    | < 1.x          |
 | >= 4.0                | 18.x    | < 1.x          |
 | >= 19.0               | 19.x    | < 1.x          |
 | >= 20.0               | 20.x    | < 1.x          |
 | >= 21.0               | 21.x    | < 1.x          |
 | >= 22.0               | 22.x    | < 1.x          |

## Installation

```bash
npm install --save @fluent/bundle @apappas1129/ngx-fluent
```

---

## Setup — standalone apps (recommended)

For any Angular project using standalone bootstrap (`bootstrapApplication`).

### 1. Register the library

Add `provideHttpClient()` and `provideNgxFluent()` to your `ApplicationConfig`. Specify `defaultLocale` to have the translation file fetched **before the root component renders** — no flash of untranslated keys on first paint:

```ts
// app.config.ts
import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';
import { provideNgxFluent } from '@apappas1129/ngx-fluent';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideHttpClient(),
    provideNgxFluent({
      sources: {
        en: 'assets/i18n/en.ftl',
        sv: 'assets/i18n/sv.ftl',
      },
      defaultLocale: 'en',
    }),
  ],
};
```

`provideHttpClient()` is a required prerequisite. The library uses Angular's `HttpClient` to fetch `.ftl` files but intentionally does not register it internally, so your app retains full control over interceptors and fetch configuration.

### 2. Use the pipe

Import `NgxFluentPipe` in any standalone component that needs translations:

```ts
import { NgxFluentPipe } from '@apappas1129/ngx-fluent';

@Component({
  imports: [NgxFluentPipe],
  template: `
    <h1>{{ 'welcome-user' | fluent: { user: name } }}</h1>
  `,
})
export class MyComponent {
  name = 'John Doe';
}
```

The pipe returns the key as-is if the translation cannot be resolved (locale not loaded, key missing).

### 3. Deferred locale init from user preference

Omit `defaultLocale` if you want to decide the initial locale at runtime — for example, from a value stored in `localStorage`:

```ts
// app.config.ts — no defaultLocale
provideNgxFluent({
  sources: {
    en: 'assets/i18n/en.ftl',
    sv: 'assets/i18n/sv.ftl',
  },
}),
```

```ts
// app.ts — set locale after app starts
export class App {
  private fluent = inject(NgxFluentService);

  constructor() {
    const saved = localStorage.getItem('locale') ?? 'en';
    this.fluent.setLocale(saved);
  }
}
```

The root component renders before the first locale loads, so untranslated keys will briefly appear. Prefer `defaultLocale` when a hard-coded startup locale is acceptable.

---

## Setup — NgModule apps (legacy)

> For projects that still bootstrap with `platformBrowserDynamic().bootstrapModule(AppModule)`. This pattern is fully supported; the library ships `NgxFluentModule` specifically for this case.

### 1. Register the library

Import `NgxFluentModule` into your root `AppModule`. It registers `HttpClient` internally with DI-based interceptor support, so no separate `HttpClientModule` is needed:

```ts
// app.module.ts
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { NgxFluentModule } from '@apappas1129/ngx-fluent';

@NgModule({
  imports: [
    BrowserModule,
    NgxFluentModule,
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
```

### 2. Configure sources in your root component

Inject `NgxFluentService` and configure it in `ngOnInit`. Translated content appears after the first `ngOnInit` cycle rather than on first paint (unlike the standalone `defaultLocale` path):

```ts
// app.component.ts
import { Component, OnInit } from '@angular/core';
import { NgxFluentService } from '@apappas1129/ngx-fluent';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
})
export class AppComponent implements OnInit {
  constructor(private fluent: NgxFluentService) {}

  ngOnInit() {
    this.fluent.setTranslationSourceMap({
      en: 'assets/i18n/en.ftl',
      sv: 'assets/i18n/sv.ftl',
    });
    this.fluent.setLocale('en');
  }
}
```

### 3. Use the pipe

`NgxFluentModule` exports the `fluent` pipe, making it available in all components declared in your `AppModule` — no per-component import needed:

```html
<h1>{{ 'welcome-user' | fluent: { user: name } }}</h1>
```

The pipe returns the key as-is if the translation cannot be resolved.

---

## Translation source formats

Each locale key in `sources` (or passed to `setTranslationSourceMap()`) accepts one of three formats:

**URL string** — the library fetches the file and builds the bundle automatically:

```ts
sources: {
  en: 'assets/i18n/en.ftl',
}
```

**URL with bundle options** — same fetch, but you control the `FluentBundle` constructor config (e.g. disable Unicode isolation markers):

```ts
sources: {
  en: {
    path: 'assets/i18n/en.ftl',
    bundleConfig: {
      useIsolating: false,
    },
  },
}
```

**Pre-built `FluentBundle` instance** — hand the library a bundle you constructed yourself. No HTTP fetch is performed:

```ts
import { FluentBundle, FluentResource } from '@fluent/bundle';

const bundle = new FluentBundle('en', { useIsolating: false });
bundle.addResource(new FluentResource('welcome-user = Welcome, {$user}!'));

sources: {
  en: bundle,
}
```

This gives you full control — useful for testing, SSR, or bundling translations at build time.

*Tip: Make your locale keys compliant to the [BCP 47 standard](https://en.wikipedia.org/wiki/IETF_language_tag) to avoid issues with Fluent's built-in functions that rely on the `Intl` API.*

---

## Adding locales incrementally

Sources don't have to be declared all at once. Call `setTranslationSourceMap()` at any point to register additional locales — for example, when the user opens a language picker for the first time:

```ts
// On startup, register only the default
this.fluent.setTranslationSourceMap({ en: 'assets/i18n/en.ftl' });
this.fluent.setLocale('en');

// Later, register more on demand
this.fluent.setTranslationSourceMap({ sv: 'assets/i18n/sv.ftl', fr: 'assets/i18n/fr.ftl' });
```

Passing a locale key that is already loaded causes its translations to be reloaded from the new source.

---

## Switching locale

Call `setLocale()` on `NgxFluentService` at any time. The service fetches the translation file if not already cached, then all active `fluent` pipes update reactively:

```ts
// standalone
private fluent = inject(NgxFluentService);

// NgModule
constructor(private fluent: NgxFluentService) {}

// both
this.fluent.setLocale('sv');
```

Switching to a previously loaded locale is instantaneous — files are cached in memory after the first fetch.

---

## Translating programmatically

`translate()` is synchronous and reads directly from the currently loaded bundle:

```ts
// standalone
private fluent = inject(NgxFluentService);

// NgModule
constructor(private fluent: NgxFluentService) {}

// both
getLabel(key: string) {
  return this.fluent.translate(key, { user: 'John' }) ?? key;
}
```

Returns `null` if the locale is not loaded or the key is not found. The `?? key` fallback mirrors what the pipe does automatically.

---

## Example projects

This repository ships two example projects.

**`ngx-fluent-example-standalone`** — a modern Angular 22 standalone app. Zoneless (no `zone.js`), signal-based component state, `OnPush` change detection by default, `provideNgxFluent` in `app.config.ts`. Reference implementation for new projects consuming the library today.

**`ngx-fluent-example`** — an Angular 22 project intentionally structured with `AppModule` and `platformBrowserDynamic` bootstrap. For teams that cannot yet migrate to standalone — demonstrates that `NgxFluentModule` provides the same behavior under the NgModule pattern. Retains `zone.js`, `ChangeDetectionStrategy.Eager`, and constructor injection, all of which are correct for that pattern.

---

## Contributing

See [Contributing Guide](/CONTRIBUTING.md).
