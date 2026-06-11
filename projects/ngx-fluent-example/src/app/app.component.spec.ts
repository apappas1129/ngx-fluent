import { provideHttpClient } from '@angular/common/http';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { NgxFluentService, NgxFluentPipe } from '@zeferinix/ngx-fluent';

import { AppComponent } from './app.component';

describe('AppComponent', () => {
  let component: AppComponent;
  let fixture: ComponentFixture<AppComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [AppComponent],
      imports: [NgxFluentPipe],
      providers: [NgxFluentService, provideHttpClient()],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AppComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeDefined();
  });

  // it('should show Current Locale as "en" the first time', () => {
  //   const compDe = fixture.debugElement;
  //   const currentLocaleElem: HTMLHeadingElement = compDe.query(By.css('.qa-current-locale')).nativeElement;

  //   expect(currentLocaleElem.textContent).toEqual('Current Locale: en');
  // });

  // it('should show Current Locale as "sv" after changing the locale', () => {
  //   const compDe = fixture.debugElement;
  //   const cycleBtn: HTMLButtonElement = compDe.query(By.css('.qa-locale-cycle-btn')).nativeElement;
  //   cycleBtn.click();
  //   fixture.detectChanges();

  //   const currentLocaleElem: HTMLHeadingElement = compDe.query(By.css('.qa-current-locale')).nativeElement;

  //   expect(currentLocaleElem.textContent).toEqual('Current Locale: sv');
  // });

  // it('should react to fluent argument changes', () => {
  //   const compDe = fixture.debugElement;
  //   const translatedMessageElem: HTMLHeadingElement = compDe.query(By.css('.qa-translated-message')).nativeElement;

  //   component.name = 'John Doe';
  //   fixture.detectChanges();

  //   expect(translatedMessageElem.textContent).toEqual('Hello John Doe');

  //   component.name = 'Everyman';
  //   fixture.detectChanges();

  //   expect(translatedMessageElem.textContent).toEqual('Hello Everyman');
  // });
});
