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

import { FormControl, FormGroup } from '@angular/forms';
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
    supportsUpdate: boolean
    detailForm = new FormGroup({
        value: new FormControl('')
    })

    constructor(private route: ActivatedRoute, private deviceApi: ApiService, private deviceStorage: DeviceStorage, public device: DeviceInfo) { 
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
            const newDevice = devices.getDeviceByIndex(0)
            this.device.update(newDevice)
            this.supportsUpdate = newDevice.actions === undefined && !newDevice.properties.includes('measured')
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

    /**
     * Publishes a new value to a device on button click
     * @param value new value to publish
     */
    onClick (value): void {
        this.deviceApi.publish(this.device.topic, value).subscribe(resp => {
            console.log(resp)
        })
    }

    /**
     * Called when updating a manually changed value
     */
    onUpdate(): void {
        console.log("click")
        const valueControl = this.detailForm.get('value')
        if (valueControl.touched) {
            this.deviceApi.publish(this.device.topic, valueControl.value).subscribe(resp => {
                console.log(resp)
            })
        }
    }

    ngOnInit() {
        this.route.paramMap.subscribe(params => {
            this.deviceTopic = params.get('topicFilter')
            if (this.deviceTopic) {
                this.deviceTopic = this.deviceTopic.split('|').join('/')
            }
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