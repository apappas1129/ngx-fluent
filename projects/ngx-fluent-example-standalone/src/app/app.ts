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
    if (this.currentLocale === 'en') {
      this.fluentService.setLocale('sv');
    } else if (this.currentLocale === 'sv') {
      this.fluentService.setLocale('invalid');
    } else {
      this.fluentService.setLocale('en');
    }
  }
}
