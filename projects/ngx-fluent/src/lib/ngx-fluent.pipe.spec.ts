import { HttpClient } from '@angular/common/http';
import { fakeAsync, TestBed, tick } from '@angular/core/testing';
import { of } from 'rxjs';

import { NgxFluentPipe } from './ngx-fluent.pipe';
import { NgxFluentService } from './ngx-fluent.service';

describe('NgxFluentPipe', () => {
  let pipe: NgxFluentPipe;
  let fluentService: NgxFluentService;
  let httpSpy: jasmine.SpyObj<HttpClient>;

  const key = 'hello';
  const translations = {
    en: `${key} = Hello { $name }`,
    sv: `${key} = Hallå { $name }`,
  };

  function applyIsolation(text: string) {
    // Unicode isolation characters are used to prevent BiDi issues.
    // It's enabled by default upstream (@fluent/bundle).
    // https://github.com/projectfluent/fluent.js/wiki/Unicode-Isolation
    return `⁨${text}⁩`;
  }

  beforeEach(() => {
    const _httpSpy = jasmine.createSpyObj('HttpClient', ['get', 'pipe']);
    TestBed.configureTestingModule({
      providers: [
        NgxFluentPipe,
        NgxFluentService,
        {
          provide: HttpClient,
          useValue: _httpSpy,
        },
      ],
    });

    pipe = TestBed.inject(NgxFluentPipe);
    fluentService = TestBed.inject(NgxFluentService);
    fluentService.setTranslationSourceMap({
      en: 'assets/locales/en.ftl',
      sv: 'assets/locales/sv.ftl',
    });

    httpSpy = TestBed.inject(HttpClient) as jasmine.SpyObj<HttpClient>;
  });

  it(`transforms "${key}" key from one language`, fakeAsync(() => {
    httpSpy.get.and.returnValue(of(translations.en));
    fluentService.setLocale('en');

    const name = 'John Doe';

    let translatedMessage = pipe.transform(key, { name });
    tick(100);
    translatedMessage = pipe.transform(key, { name });

    expect(translatedMessage).toBe(`Hello ${applyIsolation(name)}`);
  }));

  it(`transforms "${key}" key from one language to another`, fakeAsync(() => {
    httpSpy.get.and.returnValue(of(translations.en));
    fluentService.setLocale('en');

    const name = 'John Doe';

    let translatedMessage = pipe.transform(key, { name });
    tick(100);
    translatedMessage = pipe.transform(key, { name });
    expect(translatedMessage).toBe(`Hello ${applyIsolation(name)}`);

    httpSpy.get.and.returnValue(of(translations.sv));
    fluentService.setLocale('sv');

    translatedMessage = pipe.transform(key, { name });
    tick(100);
    translatedMessage = pipe.transform(key, { name });
    expect(translatedMessage).toBe(`Hallå ${applyIsolation(name)}`);
  }));

  it(`args should be reactive`, fakeAsync(() => {
    httpSpy.get.and.returnValue(of(translations.en));
    fluentService.setLocale('en');

    let name = 'John Doe';

    let translatedMessage = pipe.transform(key, { name });
    tick(100);
    translatedMessage = pipe.transform(key, { name });
    expect(translatedMessage).toBe(`Hello ${applyIsolation(name)}`);

    name = 'Billy';

    translatedMessage = pipe.transform(key, { name });
    tick(100);
    translatedMessage = pipe.transform(key, { name });
    expect(translatedMessage).toBe(`Hello ${applyIsolation(name)}`);
  }));
});
