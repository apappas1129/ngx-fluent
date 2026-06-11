/* eslint-disable @typescript-eslint/no-explicit-any */

import { DestroyRef, Pipe, PipeTransform, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NgxFluentService } from './ngx-fluent.service';
import { isEqual } from 'lodash-es';

@Pipe({
  name: 'fluent',
  // must stay impure — pure pipes are memoized by input reference and Angular would never re-call transform() to pick up signal changes; impure ensures transform() runs every CD cycle so the signal read on the return line stays registered as a live template dependency
  pure: false,
  standalone: true,
})
export class NgxFluentPipe implements PipeTransform {
  private readonly fluentService = inject(NgxFluentService);
  private readonly destroyRef = inject(DestroyRef);
  // was: plain class property — Angular had no knowledge of when it changed, so ChangeDetectorRef.markForCheck() had to be called manually after every async resolution to schedule a re-render
  // now: WritableSignal — reading it inside transform() registers this view as a dependent; when set() is called after async resolution Angular schedules a targeted re-render automatically, no ChangeDetectorRef needed
  // (best: a computed() derived from the service's locale signal would eliminate the subscription and the impure pipe entirely, but changes the public API)
  private readonly value = signal<string | null>(null);
  private previousKey?: string;
  private previousArgs?: any;
  private initialized = false;

  transform(key: string, args?: any) {
    if (!this.initialized) {
      this.initialized = true;

      // was: stored the observable reference in a nullable field and used it as the initialization guard — dual-purpose field, harder to read
      // now: plain boolean guard; the subscription itself is all that matters here
      this.fluentService.localeChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(async () => {
        // was: assigned plain property then called markForCheck() — required ChangeDetectorRef injection and manually re-entering Angular's CD
        // now: signal.set() notifies the reactive graph directly; the view re-renders only when this signal's value actually changes
        this.value.set(await this.fluentService.translate(this.previousKey ?? key, this.previousArgs));
      });
    }

    // FIXME: Could probably be optimized to only update when the args change?
    if (key !== this.previousKey || !isEqual(args, this.previousArgs)) {
      this.previousKey = key;
      this.previousArgs = args;
      this.fluentService.translate(key, args).then((v) => this.value.set(v));
    }

    // was: returned plain property — no reactive dependency registered, re-renders relied entirely on markForCheck() being called after every async resolution
    // now: this.value() is a signal read — Angular tracks it as a template dependency and re-renders this view when the signal changes, making markForCheck() unnecessary
    return this.value() ?? key;
  }
}
