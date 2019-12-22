import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { DeviceDetailsComponent } from './device-details/device-details.component';
import { DeviceListComponent } from './device-list/device-detail.component';


const routes: Routes = [
    { path: 'devicedetails/:deviceIndex', component: DeviceDetailsComponent },
    { path: 'devicelist', component: DeviceListComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
