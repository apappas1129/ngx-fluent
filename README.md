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

## Installation

```bash
npm install --save @fluent/bundle @zeferinix/ngx-fluent 
```

## Usage

### Initialize module

Import the library into your app module:

```ts
import { NgxFluentModule } from '@zeferinix/ngx-fluent';

@NgModule({
  imports: [
    // ... your other module imports
    NgxFluentModule,
  ],
})
```

### Register locale source mapping and initial locale

The library needs to know where to locate the `.ftl` files so you have to provide this first (preferably on the root of your app such as `app.component.ts`) by providing a flat object where the `key` is the `locale` code and the `value` is the `source` then passing this object to the `setTranslationSourceMap()` method of the service.

*Note: Translation sources are lazy loaded then cached in memory. Translation source for the respective locale is only loaded after calling the `setLocale()` method.*

*Tip: Make your locale keys compliant to the [BCP 47 standard](https://en.wikipedia.org/wiki/IETF_language_tag) as much as possible so that you don't encounter potential issues when using Fluent's built-in functions since they make use of the `Intl` API which also relies on the same standard. For example, see [`Intl.NumberFormat()'s locales`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/NumberFormat/NumberFormat#parameters) parameter.*

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
      en: 'assets/i18n/en.ftl', // could be on your assets folder
      sv: 'https://my.domain.com/translations/sv.ftl', // or external provided you don't get CORS issues
    });

    this.fluentService.setLocale('en');  // set initial locale
  }
}
```

If you want to pass a config to the `FluentBundle` constructor, you can do so by passing an object instead.

```ts
export class AppComponent implements OnInit {
  constructor(private fluentService: NgxFluentService) {}

  ngOnInit() {
    this.fluentService.setTranslationSourceMap({
      en: { 
        path: 'assets/i18n/en.ftl', // URL or path to the translation source
        bundleConfig: { // Pass FluentBundle config here
          useIsolating: false,
        }, 
      },
    });

    this.fluentService.setLocale('en');  // set initial locale
  }
}
```

If you want more granular control over the `FluentBundle` instances, you can pass it directly.

```ts
export class AppComponent implements OnInit {
  constructor(private fluentService: NgxFluentService) {}

  ngOnInit() {
    // Initialize your bundle somewhere
    const bundle = new FluentBundle('en', {
      useIsolating: false,
    });
    const resource = new FluentResource('welcome-user = Welcome, {$user}!');
    bundle.addResource(resource);

    this.fluentService.setTranslationSourceMap({
      en: bundle, // add it to the map, make sure the key is the same as the locale
    });

    this.fluentService.setLocale('en');  // set initial locale
  }
}
```

You can add multiple sources later as well if needed.

```ts
export class AppComponent implements OnInit {
  constructor(private fluentService: NgxFluentService) {}

  ngOnInit() {
    this.fluentService.setTranslationSourceMap({
      en: 'assets/i18n/en.ftl',
    });

    this.fluentService.setLocale('en');  // set initial locale

    // ... After some time ...
    
    this.fluentService.setTranslationSourceMap({
      sv: 'assets/i18n/sv.ftl',
    });
  }
}
```

### Switching locale

Switching to another language is as simple as calling the `setLocale()` method and passing the new locale.

```ts
export class MyComponent {
  switchLocale(locale: string) {
    this.fluentService.setLocale(locale);
  }
}
```

### Pipe

Use the `fluent` pipe.

```angular
{{ 'welcome-user' | fluent: { user: 'John Done' } }}
```

*Note: The pipe will return the key if it fails to resolve.*

### Programmatically via service

You can call the `translate()` method on the service to translate a message by passing the message key and optional arguments for interpolation.

*Note: The service will return `null` if it fails to resolve.*

```ts
export class MyComponent {
  async translate(key: string, args?: Record<string, any>) {
    const translation = await this.fluentService.translate(key, args);
    console.log(translation);
    return translation;
  }
}
```

## Contributing

See [Contributing Guide](/CONTRIBUTING.md).
