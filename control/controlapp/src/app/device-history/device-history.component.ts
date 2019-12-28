import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Device, Message, DeviceStorage  } from '../device/device';

@Component({
    selector: 'app-device-history',
    templateUrl: './device-history.component.html',
    styleUrls: ['./device-history.component.css']
})
export class DeviceHistoryComponent implements OnInit {
    deviceTopic: string
    device: Device

    constructor(private route: ActivatedRoute, private deviceStorage: DeviceStorage) {
    }

    ngOnInit() {
        this.route.paramMap.subscribe(params => {
            this.deviceTopic = params.get('deviceTopic')
            this.device = this.deviceStorage.getDevice(this.deviceTopic)
        });
    }

}
