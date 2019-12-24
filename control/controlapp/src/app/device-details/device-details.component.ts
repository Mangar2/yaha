import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { interval } from 'rxjs';

import { updateDevice } from '../device/device';

import { devices } from '../devices';
import { setDeviceValue } from '../device/communication';

@Component({
    selector: 'app-device-details',
    templateUrl: './device-details.component.html',
    styleUrls: ['./device-details.component.css']
})

export class DeviceDetailsComponent implements OnInit {
    device: any

    constructor(private route: ActivatedRoute, private http: HttpClient) { }

    /**
     * Gets data from a topic and its subtopics
     * @param topic topic to read data from
     * @param history true, to add historical data
     */
    readSingle (topic: string, history: boolean): void {
        const data = {
            topic: topic,
            history: history
        }
        this.http.post<any>("api/Arduino/NodeJs/html/sensor.php", data, {}).
            subscribe((data) => {
                if (data && data.payload && data.payload.current) {
                    const device = this.getDevice(topic)
                    updateDevice(topic, device, data)                    
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
            this.readSingle(this.device.topic, true)
            const pollForUpdate = interval(1000 * 10)
            pollForUpdate.subscribe(() => {
                this.readSingle(this.device.topic, true)        
            })
        }
        
    }

}