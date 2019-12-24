import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { interval, Observable } from 'rxjs';

import { updateDevice } from '../device/device';

import { devices } from '../devices';
import { setDeviceValue } from '../device/communication';
import { ApiService } from '../service/api.service';
import { DeviceInfo, History } from '../service/deviceinfo';

@Component({
    selector: 'app-device-details',
    templateUrl: './device-details.component.html',
    styleUrls: ['./device-details.component.css']
})

export class DeviceDetailsComponent implements OnInit {
    device: any
    history: History
    subscription: any

    constructor(private route: ActivatedRoute, private http: HttpClient, private deviceApi: ApiService) { 
    }

    /**
     * Read data from the server based on a topic
     * @param topic topic to fetch data for
     * @param history true, to add the history
     */
    getDeviceFromApi(topic: string, history: boolean) {
        this.deviceApi.getDevice(topic, history).
            subscribe(resp => {
                console.log(resp)
                const data = resp.body
                if (data && data.payload && data.payload.current) {
                    const device = this.getDevice(topic)
                    updateDevice(topic, device, data)   
                    if (data.payload.history) {
                        history = data.payload.history
                    }                 
                }
            })
    }


    onClick (device, value): void {
        setDeviceValue(this.http, device.topic, value)
    }

    /**
     * Searches the devices for a topic
     * @param topic 
     */
    getDevice (topic: string): any {
        let result = {}
        for(const device of devices) {
            if (device.topic === topic) {
                result = device
                break
            }
        }
        return result
    }

    ngOnInit() {
        this.route.paramMap.subscribe(params => {
            const deviceTopic = params.get('deviceTopic')
            this.device = this.getDevice(deviceTopic)
        });
        
        if (this.device.topic) {
            this.getDeviceFromApi(this.device.topic, true)
            const pollForUpdate = interval(2 * 1000)
            this.subscription = pollForUpdate.subscribe(() => {
                console.log("detail update");
                this.getDeviceFromApi(this.device.topic, true)
            })
        }
        
    }

    ngOnDestroy() {
        if (this.subscription !== undefined) {
            this.subscription.unsubscribe();
        }
    }

}