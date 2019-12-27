import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { devices } from '../devices';
import { timer, Observable, forkJoin } from 'rxjs';
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
    topicFilter
    subscription: any
        
    constructor(private route: ActivatedRoute, private http: HttpClient, private deviceApi: ApiService,  private deviceStorage: DeviceStorage) {
    }

    ngOnInit() {
        const pollForUpdate = timer(5 * 1000, 10 * 1000)
        this.route.paramMap.subscribe(params => {
            this.topicFilter = params.get('topicFilter');
            if (this.topicFilter === null) {
                this.topicFilter = ''
            }
            this.topicFilter = this.topicFilter.replace('%2F', '/')
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
                const device = this.deviceStorage.getDevice(topic)
                this.deviceStorage.updateDevice(topic, device, data)   
            })
    }

    /**
     * Adds a list of http responses to the device storage
     */
    addResponsesToDeviceStorage(httpResponses: any[]) {
        for (let resp of httpResponses) {
            const data = resp.body
            this.deviceStorage.replaceMany(data.payload)
        }
    }

    /**
     * Get the base topic of a topic (limited to level of subelements)
     * @param topic topic
     * @param level amount of subelements
     */
    getTopicBase(topic: string, level: number) {
        const topicArray = topic.split('/')
        if (level > topicArray.length-1) {
            level = topicArray.length - 1
        }
        const result = topicArray.slice(0, level).join('/')
        return result
    }

    /**
     * Gets data from a topic and its subtopics
     */
    readAll (): void {
        const topicBases = []
        const observables = []
        for (const device of devices) {
            if (device.topic.startsWith(this.topicFilter)) {
                observables.push(this.deviceApi.getDevice(device.topic, false))
                const topicBase = this.getTopicBase(device.topic, 3)
                if (!topicBases.includes(topicBase)) {
                    topicBases.push(topicBase)
                }
            }
        }
        forkJoin(observables).subscribe((responses) => {
            this.addResponsesToDeviceStorage(responses)
            for (const device of devices) {
                if (device.topic.startsWith(this.topicFilter)) {
                    this.deviceStorage.replaceDevice(device.topic)
                }
            }
        })
    }

    ngOnDestroy() {
        if (this.subscription !== undefined) {
            this.subscription.unsubscribe();
        }
    }

}
