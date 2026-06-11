# ngx-fluent

An [Angular](https://angular.io/) library for [Fluent](https://projectfluent.org/).

## Angular compatibility

Latest version available for each version of Angular

 | @zeferinix/ngx-fluent | Angular | @fluent/bundle |
 | --------------------- | ------- | -------------- |
 | >= 1.0                | 13.x    | < 1.x          |
 | >= 1.1                | 14.x    | < 1.x          |
 | >= 1.2                | 15.x    | < 1.x          |
 | >= 2.0                | 16.x    | < 1.x          |
 | >= 3.0                | 17.x    | < 1.x          |
 | >= 4.0                | 18.x    | < 1.x          |
 | >= 19.0               | 19.x    | < 1.x          |
 | >= 20.0               | 20.x    | < 1.x          |

## Installation

```bash
npm install --save @fluent/bundle @zeferinix/ngx-fluent
```

## Usage

### Standalone setup (recommended)

Add `provideHttpClient()` and `provideNgxFluent()` to your `ApplicationConfig`:

```ts
import { ApplicationConfig } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';
import { provideNgxFluent } from '@zeferinix/ngx-fluent';

export const appConfig: ApplicationConfig = {
  providers: [
    provideHttpClient(),
    provideNgxFluent({
      sources: {
        en: 'assets/i18n/en.ftl', // could be on your assets folder
        sv: 'https://my.domain.com/translations/sv.ftl', // or external, provided you don't get CORS issues
      },
      defaultLocale: 'en', // fetched before the app renders — no flash of untranslated keys
    }),
  ],
};
```

`provideNgxFluent` hooks into Angular's application initializer phase. When `defaultLocale` is specified, the translation file is fetched **before the root component renders**, so translated content appears on first paint. Omit `defaultLocale` if you prefer to set the locale dynamically at runtime (e.g. from a user preference stored in `localStorage`).

`provideHttpClient()` is a prerequisite — the library uses Angular's `HttpClient` to fetch `.ftl` files but intentionally does not call `provideHttpClient()` internally so your app retains full control over interceptors and fetch configuration.

Then import `NgxFluentPipe` directly in whichever standalone components use it:

```ts
import { NgxFluentPipe } from '@zeferinix/ngx-fluent';

@Component({
  imports: [NgxFluentPipe],
  // ...
})
export class MyComponent {}
```

### NgModule setup (legacy)

Import `NgxFluentModule` into your app module:

```ts
import { NgxFluentModule } from '@zeferinix/ngx-fluent';

@NgModule({
  imports: [
    // ... your other module imports
    NgxFluentModule,
  ],
})
export class AppModule {}
```

Then register translation sources and set the initial locale in your root component's `ngOnInit`:

```ts
import { Component, OnInit } from '@angular/core';
import { NgxFluentService } from '@zeferinix/ngx-fluent';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  constructor(private fluentService: NgxFluentService) {}

  ngOnInit() {
    this.fluentService.setTranslationSourceMap({
      en: 'assets/i18n/en.ftl',
      sv: 'https://my.domain.com/translations/sv.ftl',
    });

    this.fluentService.setLocale('en');
  }
}
```

*Note: Translation sources are lazy loaded then cached in memory. The translation file for a locale is only fetched after calling `setLocale()` for that locale.*

*Tip: Make your locale keys compliant to the [BCP 47 standard](https://en.wikipedia.org/wiki/IETF_language_tag) as much as possible so that you don't encounter potential issues when using Fluent's built-in functions since they make use of the `Intl` API which also relies on the same standard. For example, see [`Intl.NumberFormat()'s locales`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/NumberFormat/NumberFormat#parameters) parameter.*

### Translation source variants

Both setup approaches accept the same three source formats per locale:

**URL string**

```ts
sources: {
  en: 'assets/i18n/en.ftl',
}
```

**URL with `FluentBundle` constructor options**

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

**Pre-built `FluentBundle` instance**

```ts
import { FluentBundle, FluentResource } from '@fluent/bundle';

const bundle = new FluentBundle('en', { useIsolating: false });
bundle.addResource(new FluentResource('welcome-user = Welcome, {$user}!'));

sources: {
  en: bundle,
}
```

You can also call `setTranslationSourceMap()` multiple times to add locales incrementally:

```ts
this.fluentService.setTranslationSourceMap({ en: 'assets/i18n/en.ftl' });
this.fluentService.setLocale('en');

// ... later ...
this.fluentService.setTranslationSourceMap({ sv: 'assets/i18n/sv.ftl' });
```

### Switching locale

```ts
export class MyComponent {
  switchLocale(locale: string) {
    this.fluentService.setLocale(locale);
  }
}
```

### Pipe

Use the `fluent` pipe in your templates:

```angular
{{ 'welcome-user' | fluent: { user: 'John Doe' } }}
```

*Note: The pipe returns the key if the translation cannot be resolved.*

### Programmatically via service

Call `translate()` on the service to translate a message. The method is synchronous — it reads from the currently loaded bundle and returns immediately.

*Note: Returns `null` if the locale or message key cannot be resolved.*

```ts
export class MyComponent {
  translate(key: string, args?: Record<string, any>) {
    const translation = this.fluentService.translate(key, args);
    console.log(translation);
    return translation;
  }
}
```

## Contributing

See [Contributing Guide](/CONTRIBUTING.md).
