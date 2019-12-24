import { Component } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { devices } from '../devices';
import { interval } from 'rxjs';
import { take } from 'rxjs/operators';

import { Device } from '../device'

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
    
    constructor(private route: ActivatedRoute, private http: HttpClient) {
        this.readAll()
    }

    ngOnInit() {
        const pollForUpdate = interval(10*10 * 1000)
        this.route.paramMap.subscribe(params => {
            this.topicFilter = params.get('topicFilter');
            if (this.topicFilter === null) {
                this.topicFilter = ''
            }
        });
        this.readAll()
        pollForUpdate.subscribe(() => {
            this.readAll()
        })
    }

    onClick (device): void {
        this.setDeviceValue(device.topic, device.value === 'on' ? 'off' : 'on')
    }

    /**
     * Sets a device value
     * @param topic topic of the device
     * @param value value to set
     */
    setDeviceValue (topic: string, value: string): void {
        this.publish (topic + '/set', value)
        const pollForUpdate = interval(500)
        const pollFourTimes = pollForUpdate.pipe(take(4))
        pollFourTimes.subscribe(() => {
            this.readSingle (topic, false)
        })
        
    }

    /**
     * publish data to the sensor interface
     * @param topic topic to look for
     * @param value value to set
     */
    publish (topic: string, value: string ): void {
        const data = {
            topic: topic,
            value: value,
            timestamp: (new Date()).toISOString()
        }
        const headers = new HttpHeaders()
        headers.set('Content-type', "application/json; charset=UTF-8")

        this.http.post<string>("api/Arduino/NodeJs/html/publish.php", data, {headers}).
            subscribe((data) => {console.log(data)})
    }

    /**
     * Searches the devices for a topic
     * @param topic 
     */
    getDevice (topic: string): any {
        let result = {}
        for(let device of this.devices) {
            if (device.topic === topic) {
                result = device
                break
            }
        }
        return result
    }

    /**
     * Updates the device
     * @param topic topic of the device
     * @param device the device object
     * @param data data read from server
     */
    updateDevice(topic: string, device: Device, data: any): Device {
        if (data && data.payload && data.payload.current) {
            if (data.payload.current.topic === topic) {
                const value = data.payload.current.value
                const isOn = (value === 'on' || value === 'true' || value === true || value === '1' || value === 1)
                device.value = isOn ? 'on' : 'off'
            }
            device.reason = data.payload.current.reason
            if (!Array.isArray(device.reason)) {
                device.reason = [{ timestamp: 'unknown' }]
            }
        }
        return device
    }

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
                    this.updateDevice(topic, device, data)                    
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
                const data = {
                    topic: device.topic,
                    history: false
                }
                this.http.post<any>("api/Arduino/NodeJs/html/sensor.php", data, {}).
                    subscribe((data) => {
                        this.updateDevice(device.topic, device, data)
                    })
            }
        }
    }

}
