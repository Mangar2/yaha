/**
 * ---------------------------------------------------------------------------------------------------
 * This software is licensed under the GNU LESSER GENERAL PUBLIC LICENSE Version 3. It is furnished
 * "as is", without any support, and with no warranty, express or implied, as to its usefulness for
 * any purpose.
 *
 * File:      device-details.component.ts
 *
 * Author:      Volker Böhm
 * Copyright:   Volker Böhm
 * ---------------------------------------------------------------------------------------------------
 */

import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { timer } from 'rxjs';

import { DeviceStorage, Devices, DeviceInfo } from '../device/device';

import { ApiService } from '../service/api.service';
import { devices } from '../devices';

@Component({
    selector: 'app-device-details',
    templateUrl: './device-details.component.html',
    styleUrls: ['./device-details.component.css']
})

export class DeviceDetailsComponent implements OnInit {
    deviceTopic: string = ''
    subscription: any

    constructor(private route: ActivatedRoute, private deviceApi: ApiService, private deviceStorage: DeviceStorage, private device: DeviceInfo) { 
    }

    /**
     * Actualizes the device information 
     * @param payload data received from api
     */
    updateDevices() {
        const node = this.deviceStorage.getNodes(this.deviceTopic)
        if (node[0] !== undefined) {
            const devices = new Devices()
            devices.replaceDevice(this.deviceTopic, node[0])
            this.device.update(devices.getDeviceByIndex(0))
        }
    }

    /**
     * Read data from the server based on a topic
     * @param history true, to add the history
     */
    updateDeviceFromApi(history: boolean) {
        this.deviceApi.getDevice(this.deviceTopic, history).
            subscribe(resp => {
                const payload = resp.body.payload
                this.deviceStorage.replaceManyNodes(payload)
                for (const device of devices) {
                    this.deviceStorage.updateNodes(device)
                }
                this.updateDevices()
            })
    }

    onClick (device, value): void {
        this.deviceApi.publish(device.topic, value).subscribe(resp => {
            console.log(resp)
        })
    }

    ngOnInit() {
        this.route.paramMap.subscribe(params => {
            this.deviceTopic = params.get('deviceTopic')
            this.updateDevices()
        });
        
        const pollForUpdate = timer(0, 2 * 1000)
        this.subscription = pollForUpdate.subscribe(() => {
            console.log("detail update");
            this.updateDeviceFromApi(true)
        })
        
    }

    ngOnDestroy() {
        if (this.subscription !== undefined) {
            this.subscription.unsubscribe();
        }
    }

}