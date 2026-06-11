import { NgModule } from '@angular/core';
import { NgxFluentPipe } from './ngx-fluent.pipe';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

@NgModule({
  imports: [NgxFluentPipe],
  exports: [NgxFluentPipe],
  providers: [provideHttpClient(withInterceptorsFromDi())],
})
export class NgxFluentModule {}
