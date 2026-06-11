/* eslint-disable @typescript-eslint/no-explicit-any */

import { Pipe, PipeTransform, inject } from '@angular/core';
import { NgxFluentService } from './ngx-fluent.service';

@Pipe({
  name: 'fluent',
  // pure: false is still required. A pure pipe is memoized by input reference: when key and args have not
  // changed, Angular skips calling transform() entirely — which means fluentService.translate() is never
  // called, the LView reactive node never re-registers its dependency on the internal bundle signal, and
  // locale switches will no longer trigger re-renders. With pure: false, transform() is always called,
  // the signal read in translate() is always refreshed, and the component reliably re-renders on locale changes.
  pure: false,
  standalone: true,
})
export class NgxFluentPipe implements PipeTransform {
  private readonly fluentService = inject(NgxFluentService);

  transform(key: string, args?: any): string {
    return this.fluentService.translate(key, args) ?? key;
  }
}
