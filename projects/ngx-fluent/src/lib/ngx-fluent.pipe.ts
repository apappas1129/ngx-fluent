/* eslint-disable @typescript-eslint/no-explicit-any */

import { DestroyRef, Pipe, PipeTransform, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NgxFluentService } from './ngx-fluent.service';
import { isEqual } from 'lodash-es';

@Pipe({
  name: 'fluent',
  // must stay impure. pure pipes are memoized by input reference — if key and args have not changed Angular skips calling transform() entirely.
  // if transform() is skipped, this.value() is never read, so the component's LView reactive node never registers this.value as a dependency in that render cycle.
  // Angular refreshes signal dependencies per render cycle: if a signal is not read during a render, the LView's dependency on it is not refreshed and may be lost.
  // with pure: false, transform() is always called, this.value() is always read, and the dependency is always re-registered — ensuring the component re-renders when the signal changes.
  pure: false,
  standalone: true,
})
export class NgxFluentPipe implements PipeTransform {
  private readonly fluentService = inject(NgxFluentService);
  private readonly destroyRef = inject(DestroyRef);

  // was: plain class property (string | null). Angular had no knowledge of when it changed.
  // re-renders were forced manually via ChangeDetectorRef.markForCheck() after every async resolution —
  // markForCheck() schedules the component and all its ancestors for checking on the next CD cycle regardless of whether the value actually changed.
  //
  // now: WritableSignal. when this.value() is read synchronously inside transform() during template evaluation,
  // Angular's active reactive context — the LView reactive node that Angular creates for the component before evaluating its template —
  // records this signal as a dependency of the component view.
  // the pipe instance itself is NOT a reactive consumer; the component that contains {{ 'key' | fluent }} is.
  // when this.value.set(v) is called later from an async callback (outside any reactive context),
  // Angular notifies all consumers that registered a dependency on this signal, including the component's LView,
  // and schedules a targeted re-render of only that component — no markForCheck(), no ChangeDetectorRef.
  //
  // important distinction: signal reads (get) only register dependencies when called inside an active reactive context
  // (a computed(), an effect(), or a component template evaluation). signal writes (set/update) always notify consumers regardless of context.
  //
  // (best: a computed() or toSignal() derived from the service's locale signal would make the pipe a pure reactive expression
  // with no subscriptions, no async side effects, and no need for pure: false — but that requires changing the public API surface)
  private readonly value = signal<string | null>(null);

  private previousKey?: string;
  private previousArgs?: any;
  private initialized = false;

  transform(key: string, args?: any) {
    if (!this.initialized) {
      this.initialized = true;

      // was: used a nullable `localeChanges: Observable | null` field as both the initialization guard and the subscription source — dual-purpose field.
      // now: plain boolean guard. single responsibility, easier to follow.
      this.fluentService.localeChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(async () => {
        // this callback runs asynchronously — outside any reactive context, so no signal dependencies are tracked here.
        // set() is used deliberately: it notifies registered consumers (the component LView) regardless of context.
        // was: assigned plain property + called markForCheck() — required injecting ChangeDetectorRef and manually re-entering Angular's CD machinery.
        this.value.set(await this.fluentService.translate(this.previousKey ?? key, this.previousArgs));
      });
    }

    if (key !== this.previousKey || !isEqual(args, this.previousArgs)) {
      this.previousKey = key;
      this.previousArgs = args;
      // same as above: .then() is async, outside any reactive context. set() notifies consumers unconditionally.
      this.fluentService.translate(key, args).then((v) => this.value.set(v));
    }

    // was: returned plain property — no signal read, no reactive dependency registered, re-renders depended entirely on markForCheck() being called after every async resolution.
    // now: this.value() is a signal read. it executes synchronously during template evaluation while Angular's LView reactive node is the active context.
    // Angular captures this read and registers the component view as a consumer of this.value.
    // when this.value.set() is called later, Angular re-renders precisely this component — not via zone-triggered dirty-checking of the whole tree.
    return this.value() ?? key;
  }
}
