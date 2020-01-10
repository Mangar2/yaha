import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { RootMenuComponent } from './root-menu/root-menu.component';
import { DeviceDetailsComponent } from './device-details/device-details.component';
import { DeviceListComponent } from './device-list/device-list.component';


const routes: Routes = [
    { path: '', redirectTo: 'devicelist', pathMatch: 'full' },
    { path: 'devicedetails/:topicFilter', component: DeviceDetailsComponent },
    { path: 'devicelist', component: DeviceListComponent },
    { path: 'devicelist/:topicFilter', component: DeviceListComponent },
    { path: '**', redirectTo: 'devicelist', pathMatch: 'full' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
