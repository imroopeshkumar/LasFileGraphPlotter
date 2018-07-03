import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpModule } from '@angular/http';

import { AppComponent } from './app.component';
import { WellLogComponent } from './well-log/well-log.component';
import {CrossFilter} from './crossfilter/crossfilter.component';
import { CleanWellLogComponent } from './clean-well-log/clean-well-log.component';

@NgModule({
  declarations: [
    AppComponent,
    WellLogComponent,
    CrossFilter,
    CleanWellLogComponent
  ],
  imports: [
    BrowserModule,HttpModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
