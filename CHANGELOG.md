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

### Changed

- **Peer dependencies:** `@angular/core` and `@angular/common` bumped to `^20.0.0`.
- **Build system:** `@angular-devkit/build-angular` replaced by `@angular/build`. All builder references in `angular.json` updated to `@angular/build:*`.
- **ESLint packages:** individual `@angular-eslint/*` devDependencies consolidated under the `angular-eslint` umbrella package — the umbrella manages sub-packages as its own dependencies.
- **tsconfig:** `module` changed from `"ES2022"` to `"preserve"` (TypeScript automatically infers `moduleResolution: bundler`; the explicit `moduleResolution` field is removed). Added `typeCheckHostBindings: true` to `angularCompilerOptions`.
- **TypeScript:** `~5.8.3` → `~5.9.2`.
- **jasmine-core:** `~5.6.0` → `~5.9.0`.

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

### Upgrade notes for v20

`NgxFluentPipe` must remain `pure: false` in v19. Pure pipes are memoized by input reference — if `key` and `args` have not changed Angular skips calling `transform()` entirely, which means the signal is never read, and the component view never registers as a reactive consumer. `pure: false` ensures `transform()` always runs so the dependency is re-registered each render cycle.

In v20, `NgxFluentService.translate()` is planned to become **synchronous**, reading from a signal-stored `FluentBundle` rather than resolving a `Promise` (the HTTP fetch is the only async part; Fluent's `formatPattern()` is itself synchronous). This will allow `transform()` to read the bundle signal directly, making the component view a reactive consumer of locale changes without needing `pure: false`.

**Template syntax will not change** — `{{ 'key' | fluent: args }}` remains valid. The only breaking change will be for consumers who call `translate()` directly on the service: the return type changes from `Promise<string>` to `string`.
