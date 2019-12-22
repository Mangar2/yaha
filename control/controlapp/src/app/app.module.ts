import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

import { LocationPipe } from './app.pipe';

import { TopBarComponent } from './top-bar/top-bar.component';
import { DeviceDetailsComponent } from './device-details/device-details.component';
import { DeviceListComponent } from './device-list/device-detail.component';

@NgModule({
  declarations: [
    AppComponent,
    TopBarComponent,
    DeviceDetailsComponent,
    DeviceListComponent,
    LocationPipe
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
