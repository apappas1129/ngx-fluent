import { HttpClient } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { vi, type Mock } from 'vitest';
import { of } from 'rxjs';

import { NgxFluentPipe } from './ngx-fluent.pipe';
import { NgxFluentService } from './ngx-fluent.service';

describe('NgxFluentPipe', () => {
  let pipe: NgxFluentPipe;
  let fluentService: NgxFluentService;
  let httpSpy: { get: Mock; pipe: Mock };

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
    const _httpSpy = { get: vi.fn(), pipe: vi.fn() };
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

    httpSpy = TestBed.inject(HttpClient) as unknown as { get: Mock; pipe: Mock };
  });

  it(`transforms "${key}" key from one language`, () => {
    httpSpy.get.mockReturnValue(of(translations.en));
    fluentService.setLocale('en');

    const name = 'John Doe';
    const translatedMessage = pipe.transform(key, { name });
    expect(translatedMessage).toBe(`Hello ${applyIsolation(name)}`);
  });

  it(`transforms "${key}" key from one language to another`, () => {
    httpSpy.get.mockReturnValue(of(translations.en));
    fluentService.setLocale('en');

    const name = 'John Doe';
    expect(pipe.transform(key, { name })).toBe(`Hello ${applyIsolation(name)}`);

    httpSpy.get.mockReturnValue(of(translations.sv));
    fluentService.setLocale('sv');

    expect(pipe.transform(key, { name })).toBe(`Hallå ${applyIsolation(name)}`);
  });

  it(`args should be reactive`, () => {
    httpSpy.get.mockReturnValue(of(translations.en));
    fluentService.setLocale('en');

    let name = 'John Doe';
    expect(pipe.transform(key, { name })).toBe(`Hello ${applyIsolation(name)}`);

    name = 'Billy';
    expect(pipe.transform(key, { name })).toBe(`Hello ${applyIsolation(name)}`);
  });
});
