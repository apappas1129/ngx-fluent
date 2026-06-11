# Changelog

All notable changes to this project will be documented in this file.
The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

> **Versioning note:** Starting from v19.0.0 the library's major version matches the minimum required Angular major version. Prior releases used an independent semver sequence (see table below).

| @zeferinix/ngx-fluent | Angular |
| --------------------- | ------- |
| >= 1.0                | 13.x    |
| >= 1.1                | 14.x    |
| >= 1.2                | 15.x    |
| >= 2.0                | 16.x    |
| >= 3.0                | 17.x    |
| >= 4.0                | 18.x    |
| >= 19.0               | 19.x    |
| >= 20.0               | 20.x    |

No changelog was recorded for versions prior to 19.0.0.

---

## [Unreleased]

## [20.0.0] — 2026-06-12

### Added

- **`provideNgxFluent(config)`** — a new provider function for Angular standalone applications. Add it to the `providers` array of your `ApplicationConfig` alongside `provideHttpClient()`:

  ```ts
  export const appConfig: ApplicationConfig = {
    providers: [
      provideHttpClient(),
      provideNgxFluent({
        sources: {
          en: 'assets/i18n/en.ftl',
          sv: { path: 'assets/i18n/sv.ftl', bundleConfig: { useIsolating: false } },
        },
        defaultLocale: 'en',
      }),
    ],
  };
  ```

  The `sources` field accepts the same values as `setTranslationSourceMap()` — a URL string, a `{ path, bundleConfig }` object, or a pre-built `FluentBundle` instance. All three variants work per locale entry.

  **`defaultLocale` and bootstrap timing:** when `defaultLocale` is specified, `provideNgxFluent` hooks into Angular's application initializer phase and fetches that locale's translation file *before the root component renders*. This eliminates the flash of untranslated keys that occurs when initialization is done inside `ngOnInit` — by the time your template is evaluated for the first time, the bundle is already loaded.

  When `defaultLocale` is omitted, the sources are registered but no locale is activated at startup. Set the locale dynamically at runtime instead (e.g. from user preferences stored in `localStorage`).

  **`provideHttpClient()` is a prerequisite.** `ngx-fluent` intentionally does not call `provideHttpClient()` internally so your application retains full control over fetch configuration and interceptors.

- **`NgxFluentConfig`** interface — exported as part of the public API for consumers who want to type their config object explicitly.
- **Standalone example app** (`ngx-fluent-example-standalone`) — a second example project demonstrating the modern standalone bootstrap pattern with `provideNgxFluent()`. The original NgModule-based example (`ngx-fluent-example`) is preserved for consumers who have not yet migrated to standalone bootstrap.

### Changed

- **Peer dependencies:** `@angular/core` and `@angular/common` bumped to `^20.0.0`.
- **Build system:** `@angular-devkit/build-angular` replaced by `@angular/build`. All builder references in `angular.json` updated to `@angular/build:*`.
- **ESLint packages:** individual `@angular-eslint/*` devDependencies consolidated under the `angular-eslint` umbrella package — the umbrella manages sub-packages as its own dependencies.
- **tsconfig:** `module` changed from `"ES2022"` to `"preserve"` (TypeScript automatically infers `moduleResolution: bundler`; the explicit `moduleResolution` field is removed). Added `typeCheckHostBindings: true` to `angularCompilerOptions`.
- **TypeScript:** `~5.8.3` → `~5.9.2`.
- **jasmine-core:** `~5.6.0` → `~5.9.0`.
- **`NgxFluentService.translate()`** is now **synchronous** (`string | null` instead of `Promise<string | null>`). The service stores the active `FluentBundle` in a signal; `translate()` reads it directly so Fluent's `formatPattern()` runs inline with no async overhead. The only async operation remains the initial HTTP fetch in `setLocale()`.
- **`NgxFluentService.setLocale()`** now returns `Promise<void>` instead of `void`. The promise resolves once the locale's translation file is fetched and the bundle signal is updated. Existing callers that ignore the return value are unaffected.
- **`NgxFluentPipe`** internals simplified: the subscription to `localeChanges`, all async callbacks, and manual key/args tracking are removed. `transform()` now calls `translate()` directly — the LView reactive node registers a dependency on the internal bundle signal through that call, so locale switches still trigger targeted re-renders. `pure: false` is retained; see the Future plans section below for why this constraint cannot be lifted by the library alone.

### Breaking changes

- **`NgxFluentService.translate(key, args)`** return type changed from `Promise<string | null>` to `string | null`. Callers who used `await fluentService.translate(...)` or chained `.then()` must be updated to call it synchronously. Template usage via the `fluent` pipe is unaffected.

### Future plans

`NgxFluentPipe` must remain `pure: false` indefinitely — **this is a constraint imposed by Angular, not a library design choice**, and it cannot be lifted without a change to Angular itself.

Here is why. A pure pipe is memoized by input reference: when `key` and `args` have not changed since the last render, Angular skips calling `transform()` entirely and returns the cached result. This memoization check runs *before* `transform()` is entered — so if inputs are unchanged, `translate()` is never called, the bundle signal inside is never read, and the component's LView reactive node never re-registers its dependency on that signal. The next locale switch will still trigger one re-render (from the dependency registered in the previous cycle), but that render returns the stale cached value and re-registers nothing, breaking all subsequent updates.

The only way to eliminate `pure: false` without changing the template API would be for Angular to track signal reads that occur *inside* pipe transform calls and invalidate the memoization when those signals change — the same way an `OnPush` component is marked for check when a signal it reads changes. This is an open discussion in the Angular repository:

- [**#56401** — Mark pure pipes dirty when a signal that they read changes](https://github.com/angular/angular/issues/56401)
- [**#56407** — Signal Pipes](https://github.com/angular/angular/issues/56407)
- [**#61501** — Pipes in a signal world — Template defined computed](https://github.com/angular/angular/issues/61501)

Once Angular resolves this, `NgxFluentPipe` can drop `pure: false` with no public API change — `transform()` and template syntax remain identical. This library will adopt that as soon as the Angular version that ships the fix becomes the minimum peer dependency.

## [19.0.0] — 2026-06-12

### Changed

- **Versioning:** major version now mirrors Angular's major version. `19.x.x` requires Angular `^19.0.0`.
- **NgxFluentService:** internal state migrated from `BehaviorSubject` to `WritableSignal`. Public API additions:
  - `locale: Signal<string | null>` — read-only signal of the current locale.
  - `localeChanges: Observable<string | null>` — retained for backward compatibility and for the pipe subscription.
  - `currentLocale` getter replaces the previous `getCurrentLocale()` call pattern.
  - Constructor injection replaced with `inject()`.
- **NgxFluentPipe:** now `standalone: true`. Replaced `ChangeDetectorRef.markForCheck()` with a `WritableSignal<string | null>`. When locale or inputs change, `signal.set()` notifies the component's LView reactive node directly, scheduling a targeted re-render without zone-wide dirty-checking. Subscription cleanup uses `DestroyRef` + `takeUntilDestroyed()` instead of manual unsubscription. `pure: false` is retained — see upgrade note below.
- **NgxFluentModule:** updated from `declarations: [NgxFluentPipe]` to `imports: [NgxFluentPipe]` — a standalone pipe cannot be declared.
- **Peer dependencies:** `@angular/core` and `@angular/common` bumped to `^19.0.0`.
- **tsconfig:** aligned with Angular 19 defaults — `moduleResolution: "bundler"`, `module: "ES2022"`, removed obsolete `useDefineForClassFields: false`.

### Future plans (at time of v19 release)

`NgxFluentPipe` must remain `pure: false` in v19. Pure pipes are memoized by input reference — if `key` and `args` have not changed Angular skips calling `transform()` entirely, which means the signal is never read, and the component view never registers as a reactive consumer. `pure: false` ensures `transform()` always runs so the dependency is re-registered each render cycle.

A future version was planned where `NgxFluentService.translate()` becomes **synchronous** — delivered in v20. Template syntax is unchanged; the only breaking change for callers is the return type: `Promise<string | null>` → `string | null`.

> **Correction (added in v20):** the original note predicted that synchronous `translate()` would allow removing `pure: false`. That was incorrect. Even with a synchronous `translate()` that reads a bundle signal, Angular's pure pipe memoization still skips `transform()` when inputs are unchanged — so the signal dependency is never re-registered and locale switches eventually stop triggering re-renders. See the v20 Future plans section for the full explanation and the upstream Angular issues tracking a permanent fix.
