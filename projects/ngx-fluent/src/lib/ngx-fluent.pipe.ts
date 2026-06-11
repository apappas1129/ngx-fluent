/* eslint-disable @typescript-eslint/no-explicit-any */

import { ChangeDetectorRef, DestroyRef, Pipe, PipeTransform, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NgxFluentService } from './ngx-fluent.service';
import { isEqual } from 'lodash-es';

@Pipe({
  name: 'fluent',
  pure: false,
  standalone: true,
})
export class NgxFluentPipe implements PipeTransform {
  private readonly fluentService = inject(NgxFluentService);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly destroyRef = inject(DestroyRef);

  private value: string | null = null;
  private previousArgs?: any;
  private initialized = false;

  transform(key: string, args?: any) {
    if (!this.initialized) {
      this.initialized = true;

      this.fluentService.localeChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(async () => {
        this.value = await this.fluentService.translate(key, this.previousArgs ?? args);
        this.cdr.markForCheck();
      });
    }

    // FIXME: Could probably be optimized to only update when the args change?
    if (!isEqual(args, this.previousArgs)) {
      this.previousArgs = args;
      this.fluentService.translate(key, args).then((value) => {
        this.value = value;
        this.cdr.markForCheck();
      });
    }

    return this.value ?? key;
  }
}
