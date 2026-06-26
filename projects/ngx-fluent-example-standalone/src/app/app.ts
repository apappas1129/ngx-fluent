import { Component, inject, signal } from '@angular/core';
import { NgxFluentPipe, NgxFluentService } from '@apappas1129/ngx-fluent';

// Angular 22: OnPush is the default change detection strategy for new components.
// All state here is signal-based so Angular's reactive graph drives re-renders without
// zone.js dirty-checking the entire tree.
//
// For forms with validation, Angular 22 ships stable Signal Forms (@angular/forms/signals):
//
//   import { form, required } from '@angular/forms/signals';
//   const nameModel = signal({ name: 'John Doe' });
//   readonly nameForm = form(nameModel, f => {
//     required(f.name, { message: 'Name is required' });
//   });
//
// Our name field has no validation, so a plain signal + native input binding is sufficient.
@Component({
  selector: 'app-root',
  imports: [NgxFluentPipe],
  templateUrl: './app.html',
})
export class App {
  private readonly fluentService = inject(NgxFluentService);

  readonly name = signal('John Doe');

  get currentLocale() {
    return this.fluentService.currentLocale;
  }

  updateName(event: Event) {
    this.name.set((event.target as HTMLInputElement).value);
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
