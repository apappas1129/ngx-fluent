import { NgModule } from '@angular/core';
import { NgxFluentPipe } from './ngx-fluent.pipe';
import { provideHttpClient, withInterceptorsFromDi, withXhr } from '@angular/common/http';

@NgModule({
  imports: [NgxFluentPipe],
  exports: [NgxFluentPipe],
  providers: [provideHttpClient(withXhr(), withInterceptorsFromDi())],
})
export class NgxFluentModule {}
