import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Device, Message, getDevice } from '../device/device';
import { ReasonToTextPipe } from '../device/reason-pipe'

@Component({
    selector: 'app-device-history',
    templateUrl: './device-history.component.html',
    styleUrls: ['./device-history.component.css']
})
export class DeviceHistoryComponent implements OnInit {
    deviceTopic: string
    device: Device
    history: Message[] = []

    constructor(private route: ActivatedRoute) {
    }

    ngOnInit() {
        this.route.paramMap.subscribe(params => {
            this.deviceTopic = params.get('deviceTopic')
            this.device = getDevice(this.deviceTopic)
        });
    }

}
