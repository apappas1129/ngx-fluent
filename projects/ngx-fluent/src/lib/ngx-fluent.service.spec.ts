import { HttpClient } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { FluentBundle, FluentResource } from '@fluent/bundle';
import { of } from 'rxjs';

import { NgxFluentService } from './ngx-fluent.service';

describe('NgxFluentService', () => {
  let fluentService: NgxFluentService;
  let httpSpy: jasmine.SpyObj<HttpClient>;

  const commonLocale = 'en';
  const commonKey = 'test-key';
  const commonValue = 'test-translation';
  const commonTranslation = `${commonKey} = ${commonValue}`;

  beforeEach(() => {
    const _httpSpy = jasmine.createSpyObj('HttpClient', ['get', 'pipe']);

    TestBed.configureTestingModule({
      providers: [NgxFluentService, { provide: HttpClient, useValue: _httpSpy }],
    });

    httpSpy = TestBed.inject(HttpClient) as jasmine.SpyObj<HttpClient>;
    httpSpy.get.and.returnValue(of(''));

    fluentService = TestBed.inject(NgxFluentService);
  });

  function runCommonTests() {
    it('localeChanges should emit new locale', () => {
      fluentService.setLocale('test-locale');

      fluentService.localeChanges.subscribe((locale) => {
        expect(locale).toBe('test-locale');
      });
    });

    it('currentLocale should return null initially', () => {
      expect(fluentService.currentLocale).toBeNull();
    });

    it('currentLocale should return new locale after setting setLocale', () => {
      fluentService.setLocale(commonLocale);
      expect(fluentService.currentLocale).toBe(commonLocale);
    });

    it('unresolved locale returns null', () => {
      fluentService.setLocale('non-existent');

      const result = fluentService.translate(commonKey);
      expect(result).toBeNull();
    });

    it('resolved locale and message returns translation', () => {
      httpSpy.get.and.returnValue(of(commonTranslation));
      fluentService.setLocale(commonLocale);

      const result = fluentService.translate(commonKey);
      expect(result).toBe(commonValue);
    });

    it('resolved locale and unresolved message returns null', () => {
      const unknownKey = 'unknown-key';

      httpSpy.get.and.returnValue(of(commonTranslation));
      fluentService.setLocale(commonLocale);

      const result = fluentService.translate(unknownKey);
      expect(result).toBeNull();
    });

    it('should remove locale key from source map after loading a locale', () => {
      expect(Object.keys(fluentService['translationSourceMap'])).toEqual([commonLocale]);

      fluentService.setLocale(commonLocale);

      expect(Object.keys(fluentService['translationSourceMap'])).toEqual([]);
    });

    it('should reload the existing locale translations if setSourceTranslationMap receives a previously loaded locale', () => {
      httpSpy.get.and.returnValue(of(commonTranslation));
      fluentService.setLocale(commonLocale);

      expect(fluentService.translate(commonKey)).toBe(commonValue);

      const newValue = 'new-translation';

      const bundle = new FluentBundle(commonLocale);
      const resource = new FluentResource(`${commonKey} = ${newValue}`);
      bundle.addResource(resource);

      fluentService.setTranslationSourceMap({
        [commonLocale]: bundle,
      });

      expect(fluentService.translate(commonKey)).toBe(newValue);
    });
  }

  describe('SetTranslationSourceMap option uses Record<string, string>', () => {
    beforeEach(() => {
      fluentService.setTranslationSourceMap({
        [commonLocale]: `assets/locales/${commonLocale}.ftl`,
      });
    });

    runCommonTests();
  });

  describe('SetTranslationSourceMap option uses Record<string, FluentBundleOptions>', () => {
    beforeEach(() => {
      fluentService.setTranslationSourceMap({
        [commonLocale]: { path: `assets/locales/${commonLocale}.ftl`, bundleConfig: undefined },
      });
    });

    runCommonTests();
  });

  describe('SetTranslationSourceMap option uses FluentBundle instance', () => {
    beforeEach(() => {
      const bundle = new FluentBundle(commonLocale);
      const resource = new FluentResource(commonTranslation);
      bundle.addResource(resource);

      fluentService.setTranslationSourceMap({
        [commonLocale]: bundle,
      });
    });

    runCommonTests();
  });
});
