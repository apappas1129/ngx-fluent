import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { NgxFluentModule } from '@apappas1129/ngx-fluent';

import { AppComponent } from './app.component';

@NgModule({
  declarations: [AppComponent],
  imports: [BrowserModule, NgxFluentModule, FormsModule],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
