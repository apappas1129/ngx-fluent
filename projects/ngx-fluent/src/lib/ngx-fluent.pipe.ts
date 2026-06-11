/* eslint-disable @typescript-eslint/no-explicit-any */

import { Pipe, PipeTransform } from '@angular/core';
import { Observable } from 'rxjs';
import { NgxFluentService } from './ngx-fluent.service';
import { isEqual } from 'lodash-es';

@Pipe({
    name: 'fluent',
    pure: false,
    standalone: false
})
export class NgxFluentPipe implements PipeTransform {
  value: string | null = null;

  localeChanges: Observable<string | null> | null = null;

  previousArgs?: any;

  constructor(private readonly fluentService: NgxFluentService) {}

  transform(key: string, args?: any) {
    if (!this.localeChanges) {
      this.localeChanges = this.fluentService.localeChanges;

      this.localeChanges.subscribe(async () => {
        this.value = await this.fluentService.translate(key, this.previousArgs ?? args);
      });
    }

    // FIXME: Could probably be optimized to only update when the args change?
    if (!isEqual(args, this.previousArgs)) {
      this.previousArgs = args;
      this.fluentService.translate(key, args).then((value) => {
        this.value = value;
      });
    }

    return this.value ?? key;
  }
}
