import { Component } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { devices } from '../devices';
import { timer } from 'rxjs';
import { take } from 'rxjs/operators';
import { ApiService } from '../service/api.service';

import { DeviceStorage } from '../device/device';

@Component({
    selector: 'app-device-list',
    templateUrl: './device-list.component.html',
    styleUrls: ['./device-list.component.css']
})
export class DeviceListComponent {
    title = 'yaha Smart Home'
    devices = devices
    deviceStatus = {}
    topicFilter = 'first'
    subscription: any
        
    constructor(private route: ActivatedRoute, private http: HttpClient, private deviceApi: ApiService,  private deviceStorage: DeviceStorage) {
        this.readAll()
    }

    ngOnInit() {
        const pollForUpdate = timer(5 * 1000, 10 * 1000)
        this.route.paramMap.subscribe(params => {
            this.topicFilter = params.get('topicFilter');
            this.topicFilter = this.topicFilter.replace('%2F', '/')
            console.log(this.topicFilter)
            if (this.topicFilter === null) {
                this.topicFilter = ''
            }
            this.readAll()
        });
        this.subscription = pollForUpdate.subscribe(() => {
            console.log('Read to ' + this.topicFilter);
            this.readAll()
        })
    }

    onClick (device): void {
        const value = device.value === 'on' ? 'off' : 'on'
        if (device.actions.includes(value)) {
            this.deviceApi.publish(device.topic, value).subscribe(resp => {
                const pollForUpdate = timer(500, 500).pipe(take(4))
                this.subscription = pollForUpdate.subscribe(() => {
                    this.updateDeviceFromApi(device.topic, false)
                })
            })
        }

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
                if (data && data.payload && data.payload.current) {
                    const device = this.deviceStorage.getDevice(topic)
                    this.deviceStorage.updateDevice(topic, device, data)   
                    if (data.payload.history) {
                        history = data.payload.history
                    }                 
                }
            })
    }

    /**
     * Gets data from a topic and its subtopics
     * @param topic topic to read data from
     * @param history true, to add historical data
     */
    readAll (): void {
        for (const device of devices) {
            if (device.topic.startsWith(this.topicFilter)) {
                this.updateDeviceFromApi(device.topic, false)
            }
        }
    }

    ngOnDestroy() {
        if (this.subscription !== undefined) {
            this.subscription.unsubscribe();
        }
    }

}
