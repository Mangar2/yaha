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
    topicFilter: string
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
            this.topicFilter = this.topicFilter.split('|').join('/')
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
        if (device.actions !== undefined && device.actions.includes(value)) {
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
     * @param deviceTopic topic to fetch data for
     * @param history true, to add the history
     */
    updateDeviceFromApi(deviceTopic: string, history: boolean) {
        const topic = deviceTopic.split('|').join('/')
        this.deviceApi.getDevice(topic, history).
            subscribe(resp => {
                const payload = resp.body.payload
                this.deviceStorage.replaceManyNodes(payload)
                const nodes = this.deviceStorage.getNodes(topic)
                if (nodes[0] !== undefined) {
                    this.devices.updateDevice(deviceTopic, nodes[0])   
                }
            })
    }

    /**
     * Selects the properties to filter shown devices
     */
    selectFilterProperties(): string[] {
        let result: string[]
        const topicFilter = this.topicFilter.split('|').join('/')
        const topicFilterLength = topicFilter === '' ? 0 : topicFilter.split('/').length
        switch (topicFilterLength) {
            case 0: result = ['favorit']; break;
            case 1: result = ['favorit', 'control', 'security', 'level1']; break;
            case 2:
            case 3: result = ['favorit', 'level1', 'level2', 'control', 'security', 'measured']; break;
            default: result = undefined
        }
        return result
    }

    /**
     * Update the devices by applying a filter
     */
    updateDevices() {
        const filterProperties = this.selectFilterProperties()
        const nodes = this.deviceStorage.filterNodes(this.topicFilter, filterProperties)
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
