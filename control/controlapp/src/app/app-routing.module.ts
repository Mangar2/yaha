import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { RootMenuComponent } from './root-menu/root-menu.component';
import { DeviceDetailsComponent } from './device-details/device-details.component';
import { DeviceListComponent } from './device-list/device-list.component';


const routes: Routes = [
    { path: '', component: RootMenuComponent },
    { path: 'devicedetails/:deviceTopic', component: DeviceDetailsComponent },
    { path: 'devicelist', component: DeviceListComponent },
    { path: 'devicelist/:topicFilter', component: DeviceListComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
