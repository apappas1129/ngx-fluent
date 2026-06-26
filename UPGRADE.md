# Angular Incremental Upgrade Guide

A practical guide for incrementally upgrading an Angular library workspace through multiple major versions. Based on the real upgrade path from Angular 19 → 20 → 21 → 22 in this repository.

---

## Principles

- **One major version per branch.** Never skip versions. Each `feat/angular-N` branch targets exactly one major version.
- **Commit every logical step.** Distinct commits make rollback trivial and the git log self-documenting. Never bundle a migration with a manual fix.
- **Research before coding.** Read the Angular blog, migration guides, and community posts for each target version before running any command. Know what breaking changes and new features are expected.
- **Treat migration artifacts as suspects.** `ng update` schematics are conservative — they preserve existing behavior for old projects. You are not migrating an old project; you are keeping a library current. Most defensive additions should be reverted.
- **Verify with tests after every change.** Run all three test suites (library, legacy example, standalone example) before committing.

---

## Environment Setup (WSL)

If running in WSL with a Windows Node.js on `PATH`, npm symlink operations will fail with `EISDIR`. Always activate nvm first:

```bash
source ~/.nvm/nvm.sh && nvm use 22
```

Add this to your shell session before any `npm` or `ng` command.

---

## Upgrade Process (Per Major Version)

### Step 1 — Create a feature branch

```bash
git checkout -b feat/angular-N
```

### Step 2 — Research the target version

Before touching any code:

- Read the Angular blog post for version N.
- Read community upgrade articles (angular.love, Ninja Squad, etc.).
- Note: breaking changes, removed APIs, new defaults, new decorators/functions, migration schematic behavior.

Build a list of things to do manually after `ng update`. Do not skip this — the schematic will silently add things that look correct but are migration artifacts.

### Step 3 — Run `ng update`

```bash
ng update @angular/core@N @angular/cli@N
```

If peer dependency conflicts arise:

```bash
ng update @angular/core@N @angular/cli@N --allow-dirty --force
```

Then update remaining Angular packages and any ecosystem packages (e.g. `angular-eslint`, `ng-packagr`) to the versions compatible with version N. Check their release notes for the matching version.

```bash
npm install @angular/... angular-eslint@N ng-packagr@N
```

### Step 4 — Audit the migration diff

Run `git diff` and read every change the schematic made. Categorize each change as:

- **Correct** — keep as-is
- **Migration artifact** — the schematic added this to preserve old behavior; it does not belong in a fresh or up-to-date project
- **Incomplete** — the schematic did part of the work; you need to finish it manually

Common artifact patterns:
- `withXhr()` added to `provideHttpClient()` — preserves XHR where Fetch is now the correct default
- `provideZoneChangeDetection()` added to standalone apps — only needed for zone-based apps
- `ChangeDetectionStrategy.Eager` added to components — the old `Default`, added because OnPush became the new default
- `extendedDiagnostics` suppressions added to tsconfigs — silences stricter template checks that only affect migrated code
- `zone.js` left in polyfills for standalone apps — new projects are zoneless

For each artifact, revert it and understand why it was added. Document the decision in the commit message.

### Step 5 — Apply manual changes for the target version

Version-specific work that the schematic cannot do for you. Examples from this upgrade history:

**Angular 20:**
- Replace `@angular-devkit/build-angular` with `@angular/build` in `devDependencies` and all `angular.json` builder references (`@angular-devkit/build-angular:*` → `@angular/build:*`)
- Add `provideNgxFluent(config)` provider function for standalone apps — hooks into `APP_INITIALIZER` to fetch `defaultLocale` before first render
- Add standalone example project (`ngx-fluent-example-standalone`) as a second reference app
- Update library `package.json` peer dependencies and version

**Angular 21:**
- Replace Karma + Jasmine with Vitest + jsdom (see below)
- Update `angular.json` test targets from `@angular/build:karma` to `@angular/build:unit-test`
- Convert spy API in spec files from Jasmine (`jasmine.createSpyObj`, `.and.returnValue`) to Vitest (`vi.fn()`, `.mockReturnValue()`)
- Remove `fakeAsync` from tests where the operations it wrapped are synchronous
- `platformBrowserDynamic().bootstrapModule()` in NgModule example: migration schematic adds `{ applicationProviders: [provideZoneChangeDetection()] }` as a second argument — keep it for the NgModule example

**Angular 22:**
- Replace `@Injectable({ providedIn: 'root' })` with `@Service()` where applicable (requires `inject()` for deps — no constructor injection)
- Update `tsconfig.json` root with `"ignoreDeprecations": "6.0"` if TypeScript 6 is introduced and `baseUrl` is in use
- Remove `withXhr()` from library's `NgxFluentModule` (migration artifact — Fetch is the Angular 22 default and works correctly for `.ftl` fetching)
- Revert `ChangeDetectionStrategy.Eager` to `OnPush` in signal-driven components (schematic adds `Eager` defensively; `OnPush` is correct when all state is signal-based)
- Update library `package.json` peer dependencies and version

### Step 6 — Run all test suites

```bash
npm run test:lib
npm run test:legacy
npm run test:standalone
```

All must pass before any commit. Fix failures before proceeding.

### Step 7 — Commit in logical units

Do not commit everything at once. Suggested breakdown:

```
feat(lib): upgrade Angular core and CLI to vN
fix(...): revert migration artifact — [brief description]
fix(...): revert migration artifact — [brief description]
feat(lib): apply Angular N manual changes — [brief description]
fix(example-...): [fix description]
```

Each commit should leave the repo in a buildable, test-passing state.

---

## Vitest Migration (Angular 21)

Angular 21 ships Vitest as the default test runner for new projects, replacing Karma + Jasmine.

**`angular.json` — change each test target:**

```json
"test": {
  "builder": "@angular/build:unit-test",
  "options": {
    "buildTarget": "PROJECT:build",
    "runner": "vitest",
    "tsConfig": "projects/PROJECT/tsconfig.spec.json"
  }
}
```

Remove any `--browsers ChromeHeadless` flags from npm test scripts — `unit-test` does not accept them.

**`tsconfig.spec.json` — add vitest globals type:**

```json
{
  "compilerOptions": {
    "types": ["vitest/globals"]
  }
}
```

**`package.json` — add test dependencies:**

```json
"vitest": "^4.0.0",
"jsdom": "^28.0.0"
```

Remove all karma and jasmine packages.

**Spec file migration — replace Jasmine APIs:**

| Jasmine | Vitest |
|---------|--------|
| `jasmine.createSpyObj('name', ['method'])` | `{ method: vi.fn() }` |
| `spy.method.and.returnValue(x)` | `spy.method.mockReturnValue(x)` |
| `spy.method.and.callFake(fn)` | `spy.method.mockImplementation(fn)` |
| `spy.method` (type) | `Mock` (from `import { vi, type Mock } from 'vitest'`) |

Import `vi` and `Mock` at the top of each spec file:

```ts
import { vi, type Mock } from 'vitest';
```

**`fakeAsync` — remove where operations are synchronous.** If your service uses `of(value)` mocks from RxJS, the observable resolves synchronously and `fakeAsync`/`tick` are unnecessary. Remove them. (Note: `fakeAsync` also requires `zone.js/testing` which may not be available in zoneless setups.)

---

## NgModule Legacy Example Spec Fix

Angular's strict template compiler (`@angular/build:unit-test`) compiles templates at build time. Non-standalone components that use pipes or directives from a module cannot be tested without providing the full module context — `imports: [NgxFluentPipe]` in `TestBed` is not enough.

Fix: import the full `AppModule` in the test:

```ts
await TestBed.configureTestingModule({
  imports: [AppModule],
}).compileComponents();
```

---

## Zoneless Standalone Apps (Angular 22)

New Angular 22 projects are zoneless by default. The migration schematic does not know this and adds zone.js defensively. For a standalone app that should be fully zoneless:

1. Remove `zone.js` from `angular.json` build polyfills
2. Remove `provideZoneChangeDetection()` from `app.config.ts`
3. Keep `provideBrowserGlobalErrorListeners()` — this is the Angular 22 standard for all apps

The minimal `app.config.ts` for a zoneless standalone app:

```ts
export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideHttpClient(),
    // ... app-specific providers
  ],
};
```

---

## Revert Checklist After `ng update`

Run through this list after every `ng update` for a standalone-first project:

- [ ] `withXhr()` — remove from `provideHttpClient()` calls (Fetch is the Angular 22+ default)
- [ ] `provideZoneChangeDetection()` — remove from standalone app config
- [ ] `zone.js` in polyfills — remove from standalone build target
- [ ] `ChangeDetectionStrategy.Eager` — review; only keep where zone-based CD + mutable properties require it
- [ ] `extendedDiagnostics` suppressions in tsconfigs — remove; these silence new checks that only affect migrated templates
- [ ] Library `withXhr()` in `NgxFluentModule` — remove; Fetch backend works correctly for `.ftl` file fetching

---

## Final Commit Before Branch is Done

After all tests pass and all artifacts are cleaned up, do a final review:

```bash
git log --oneline feat/angular-(N-1)..HEAD
git diff feat/angular-(N-1)
```

Ensure no unintended files are staged (build output, IDE files, `.env`). Then push:

```bash
git push -u origin feat/angular-N
```
