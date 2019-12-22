import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { LocationMenuComponent } from './location-menu/location-menu.component';
import { DeviceDetailsComponent } from './device-details/device-details.component';
import { DeviceListComponent } from './device-list/device-list.component';


const routes: Routes = [
    { path: '', component: LocationMenuComponent },
    { path: 'devicedetails/:deviceTopic', component: DeviceDetailsComponent },
    { path: 'devicelist', component: DeviceListComponent },
    { path: 'devicelist/:topicFilter', component: DeviceListComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
