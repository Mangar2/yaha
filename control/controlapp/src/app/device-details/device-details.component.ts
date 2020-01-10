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
import { timer, Subscription } from 'rxjs';

import { DeviceInfo, DeviceSubject } from '../device/device';
import { DeviceStorage } from '../device/DeviceStorage'

import { ApiService } from '../service/api.service';
import { devices } from '../devices';

@Component({
    selector: 'app-device-details',
    templateUrl: './device-details.component.html',
    styleUrls: ['./device-details.component.css']
})

export class DeviceDetailsComponent implements OnInit {
    deviceTopic: string = ''
    device: DeviceInfo
    subscription: Subscription = new Subscription()
    supportsSetValue: boolean
    detailForm = new FormGroup({
        value: new FormControl('')
    })

    constructor(private route: ActivatedRoute, private deviceApi: ApiService, private deviceStorage: DeviceStorage, public deviceSubject: DeviceSubject) { 
    }

    /**
     * Actualizes the device information 
     * @param payload data received from api
     */
    updateDevice() {
        const nodes = this.deviceStorage.getNodes(this.deviceTopic)
        const node = nodes[0]
        if (node !== undefined) {
            this.deviceSubject.update(node)
            this.supportsSetValue = this.deviceSubject.device.supportsSetValue()
        }
    }

    /**
     * Read data from the server based on a topic
     * @param history true, to add the history
     */
    updateStorageFromApi(history: boolean) {
        this.deviceApi.getDevice(this.deviceTopic, history).
            subscribe(resp => {
                const payload = resp.body.payload
                this.deviceStorage.replaceManyNodes(payload)
                for (const configuration of devices) {
                    this.deviceStorage.updateNodes(configuration)
                }
                this.updateDevice()
            })
    }

    /**
     * Publishes a new value to a device on button click
     * @param value new value to publish
     */
    onClick (value): void {
        this.deviceApi.publish(this.deviceSubject.device.topic, value).subscribe(resp => {
            console.log(resp)
        })
    }

    /**
     * Called when updating a manually changed value
     */
    onUpdate(): void {
        const valueControl = this.detailForm.get('value')
        if (valueControl.touched) {
            this.deviceApi.publish(this.deviceSubject.device.topic, valueControl.value).subscribe(resp => {
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
            this.updateDevice()
        });
        this.subscription.add(this.deviceSubject.subscribe((device) => {
            this.device = device
        }))

        const pollForUpdate = timer(0, 2 * 1000)
        this.subscription.add(pollForUpdate.subscribe(() => {
            console.log("detail update");
            this.updateStorageFromApi(true)
        }))


        
    }

    ngOnDestroy() {
        this.subscription.unsubscribe()
    }

}