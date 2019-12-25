import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

import { LocationPipe } from './app.pipe';
import { LocalTimePipe } from './device/time-pipe';
import { ReasonToTextPipe } from './device/reason-pipe'

import { TopBarComponent } from './top-bar/top-bar.component';
import { LocationMenuComponent } from './location-menu/location-menu.component';
import { DeviceDetailsComponent } from './device-details/device-details.component';
import { DeviceListComponent } from './device-list/device-list.component';
import { DeviceHistoryComponent } from './device-history/device-history.component';

@NgModule({
  declarations: [
    AppComponent,
    TopBarComponent,
    LocationMenuComponent,
    DeviceDetailsComponent,
    DeviceListComponent,
    LocationPipe,
    LocalTimePipe,
    ReasonToTextPipe,
    DeviceHistoryComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
