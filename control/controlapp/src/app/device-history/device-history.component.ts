import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Device, Devices, DeviceStorage, DeviceInfo } from '../device/device';

@Component({
    selector: 'app-device-history',
    templateUrl: './device-history.component.html',
    styleUrls: ['./device-history.component.css']
})
export class DeviceHistoryComponent implements OnInit {
    deviceTopic: string

    constructor(private route: ActivatedRoute, private deviceStorage: DeviceStorage, private device: DeviceInfo) {
    }

    
    /**
     * Actualizes the device information 
     * @param payload data received from api
     */
    updateDevices() {
        const node = this.deviceStorage.getNodes(this.deviceTopic)
        console.log(node)
        if (node[0] !== undefined) {
            const devices = new Devices()
            devices.replaceDevice(this.deviceTopic, node[0])
            this.device = devices.getDeviceByIndex(0)
            console.log(this.device)
        }
    }

    ngOnInit() {
        this.route.paramMap.subscribe(params => {
            this.deviceTopic = params.get('deviceTopic')
            console.log(this.device)
            //this.updateDevices()
        });
    }

}
