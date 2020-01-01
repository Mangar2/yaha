import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { devices } from '../devices';
import { timer } from 'rxjs';
import { take } from 'rxjs/operators';
import { ApiService } from '../service/api.service';

import { DeviceStorage, Devices } from '../device/device';

@Component({
    selector: 'app-device-list',
    templateUrl: './device-list.component.html',
    styleUrls: ['./device-list.component.css']
})
export class DeviceListComponent {
    title = 'yaha Smart Home'
    devices = new Devices()
    topicFilter
    subscription: any
        
    constructor(private route: ActivatedRoute, private deviceApi: ApiService,  private deviceStorage: DeviceStorage) {

    }

    ngOnInit() {
        const pollForUpdate = timer(0, 10 * 1000)
        this.route.paramMap.subscribe(params => {
            this.topicFilter = params.get('topicFilter');
            if (this.topicFilter === null) {
                this.topicFilter = ''
            }
            this.topicFilter = this.topicFilter.replace('%2F', '/')
            if (!this.deviceStorage.isEmpty()) {
                this.updateDevices()
            }
        });
        this.subscription = pollForUpdate.subscribe(() => {
            this.readTree()
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
                const deviceInfo = data.payload[topic]
                const device = this.devices.getDevice(topic)
                this.deviceStorage.updateNodes(device)
                this.devices.updateDevice(topic, deviceInfo)   
            })
    }

    /**
     * Update the devices by applying a filter
     */
    updateDevices() {
        const nodes = this.deviceStorage.filterNodes(this.topicFilter, ['control', 'measured'])
        const devices = new Devices()
        for (const node of nodes) {
            devices.replaceDevice(node.topic, node)
        }
        this.devices = devices
    }

    /**
     * reads a full tree and populates the UI from the result
     */
    readTree (): void {
        this.deviceApi.getDevice('', false, 7).
        subscribe(resp => {
            const payload = resp.body.payload
            this.deviceStorage.replaceManyNodes(payload)
            for (const device of devices) {
                this.deviceStorage.updateNodes(device)
            }
            this.updateDevices()
        })
    }

    ngOnDestroy() {
        if (this.subscription !== undefined) {
            this.subscription.unsubscribe();
        }
    }

}
