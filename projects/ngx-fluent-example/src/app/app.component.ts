import { Component, OnInit } from '@angular/core';
import { NgxFluentService } from '@zeferinix/ngx-fluent';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss'],
    // eslint-disable-next-line @angular-eslint/prefer-standalone
    standalone: false
})
export class AppComponent implements OnInit {
  name = 'John Doe';

  get currentLocale() {
    return this.fluentService.currentLocale;
  }

  constructor(private fluentService: NgxFluentService) {}

  ngOnInit() {
    this.fluentService.setTranslationSourceMap({
      en: 'assets/i18n/en.ftl',
      sv: { path: 'assets/i18n/sv.ftl' },
    });

    this.fluentService.setLocale('en');
  }

  cycleLocale() {
    if (this.currentLocale === 'en') {
      this.fluentService.setLocale('sv');
    } else if (this.currentLocale === 'sv') {
      this.fluentService.setLocale('invalid');
    } else if (this.currentLocale === 'invalid') {
      this.fluentService.setLocale('en');
    }
  }
}
