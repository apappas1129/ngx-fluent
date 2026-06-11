import { NgModule } from '@angular/core';
import { NgxFluentPipe } from './ngx-fluent.pipe';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

// withInterceptorsFromDi() enables DI-based HTTP interceptors (HTTP_INTERCEPTORS token) for
// NgModule apps. withXhr() is intentionally omitted — Fetch is the Angular 22 default and
// works fine for fetching .ftl files.
@NgModule({
  imports: [NgxFluentPipe],
  exports: [NgxFluentPipe],
  providers: [provideHttpClient(withInterceptorsFromDi())],
})
export class NgxFluentModule {}
