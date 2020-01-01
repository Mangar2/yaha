import { Component, OnInit } from '@angular/core';
import { DeviceInfo } from '../device/device';

@Component({
    selector: 'app-device-history',
    templateUrl: './device-history.component.html',
    styleUrls: ['./device-history.component.css']
})
export class DeviceHistoryComponent implements OnInit {
    deviceTopic: string

    constructor(private device: DeviceInfo) {
    }
  
    ngOnInit() {
    }

}
