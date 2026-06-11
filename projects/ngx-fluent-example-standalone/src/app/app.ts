import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgxFluentPipe, NgxFluentService } from '@zeferinix/ngx-fluent';

@Component({
  selector: 'app-root',
  imports: [NgxFluentPipe, FormsModule],
  templateUrl: './app.html',
})
export class App {
  private readonly fluentService = inject(NgxFluentService);

  name = 'John Doe';

  get currentLocale() {
    return this.fluentService.currentLocale;
  }

  cycleLocale() {
    this.fluentService.setLocale(this.currentLocale === 'en' ? 'sv' : 'en');
  }
}
