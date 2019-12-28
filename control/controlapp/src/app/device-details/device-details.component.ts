import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { timer } from 'rxjs';

import { DeviceStorage } from '../device/device';

import { ApiService } from '../service/api.service';
import { History } from '../device/device';

@Component({
    selector: 'app-device-details',
    templateUrl: './device-details.component.html',
    styleUrls: ['./device-details.component.css']
})

export class DeviceDetailsComponent implements OnInit {
    device: any
    subscription: any

    constructor(private route: ActivatedRoute, private http: HttpClient, private deviceApi: ApiService, private deviceStorage: DeviceStorage) { 
    }

    /**
     * Read data from the server based on a topic
     * @param topic topic to fetch data for
     * @param history true, to add the history
     */
    updateDeviceFromApi(topic: string, history: boolean) {
        this.deviceApi.getDevice(topic, history).
            subscribe(resp => {
                const data = resp.body
                if (data && data.payload) {
                    const deviceInfo = data.payload[topic]
                    const device = this.deviceStorage.getDevice(topic)
                    this.deviceStorage.updateDevice(topic, device, deviceInfo)   
                }
            })
    }

    onClick (device, value): void {
        this.deviceApi.publish(device.topic, value).subscribe(resp => {
            console.log(resp)
        })
    }

    ngOnInit() {
        this.route.paramMap.subscribe(params => {
            const deviceTopic = params.get('deviceTopic')
            this.device = this.deviceStorage.getDevice(deviceTopic)
        });
        
        if (this.device.topic) {
            const pollForUpdate = timer(0, 2 * 1000)
            this.subscription = pollForUpdate.subscribe(() => {
                console.log("detail update");
                this.updateDeviceFromApi(this.device.topic, true)
            })
        }
        
    }

    ngOnDestroy() {
        if (this.subscription !== undefined) {
            this.subscription.unsubscribe();
        }
    }

}