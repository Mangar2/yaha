/**
 * ---------------------------------------------------------------------------------------------------
 * This software is licensed under the GNU LESSER GENERAL PUBLIC LICENSE Version 3. It is furnished
 * "as is", without any support, and with no warranty, express or implied, as to its usefulness for
 * any purpose.
 *
 * File:      deviceStorage.ts
 *
 * Author:      Volker Böhm
 * Copyright:   Volker Böhm
 * ---------------------------------------------------------------------------------------------------
 */

import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

export interface Reason {
    timestamp: string;
    message: string;
}

export interface Message {
    topic?: string;
    value: string | number;
    reason?: Reason[];
}

export interface History {
    time?: string;
    value?: string;
    reason?: Reason[]
}

export interface Device {
    name?: string
    time?: string
    topic?: string
    value?: string
    reason?: Reason[]
    history?: History[]
    actions?: string[]
    properties?: string[]
    pictures?: any
}
 
/**
 * Node of the device tree
 */
export interface StorageNode extends Device {
     childs: { [key:string]: StorageNode }
     debug?: boolean
}


/**
 * Payload read from server
 */
export interface Payload {
    childs: { [key:string]: Device }
}

/**
  * Device storage
  */
 @Injectable({
    providedIn: 'root',
})
export class DeviceInfo implements Device {
    name: string
    topic: string
    value: string
    reason: Reason[]
    history: History[]
    actions: string[]
    properties: string[]
    pictures: any

    constructor() {
    }

    /**
     * Checks, if the device supports setting values read from an input field
     */
    supportsSetValue(): boolean {
        return this.actions === undefined && !this.properties.includes('measured')
    }

    /**
     * Updates a device, changing some of its attributes
     * @param node node having device attributes
     */
    update(node: Device = undefined) {
        if (node !== undefined)  {
            const topicChunks = node.topic !== undefined ? node.topic.split('/') : []
            for (const property of ['time', 'name', 'value', 'reason', 'history', 'actions', 'properties', 'pictures']) {
                this[property] = node[property]
            }
            this.topic = topicChunks.join('|')
            if (this.actions !== undefined && this.actions.includes('on')) {
                const isOn = (this.value === 'on' || this.value === 'true' || Number(this.value) > 0)
                this.value = isOn ? 'on' : 'off'
            } 
            if (this.name !== undefined) {
                for (let i = 1; i <= 5; i++) {
                    this.name = this.name.replace('[' + i + ']', topicChunks[i - 1])
                }
            } else {
                this.name = topicChunks.pop()
            }
            if (!Array.isArray(this.reason)) {
                this.reason = []
            }
            if (!Array.isArray(this.properties)) {
                this.properties = []
            }
        }
    }
}

/**
  * Device storage
  */
 @Injectable({
    providedIn: 'root',
})
export class DeviceSubject extends Subject<DeviceInfo> {
    device: DeviceInfo = new DeviceInfo()

    /**
     * Updates a device, changing some of its attributes. The subjects supports subscribing for these changes
     * @param node node having device attributes
     */
    update(node: Device) {
        this.device.update(node)
        this.next(this.device)
    }

}


export class Devices {
    devices: DeviceInfo[] = []

    constructor() {
    }

    /**
     * Gets a device providing the index
     * @param index of the device
     */
    public getDeviceByIndex(index: number): DeviceInfo | undefined {
        return this.devices[index]
    }

    /**
     * Updates the device
     * @param topic topic of the device
     * @param data data read from server
     */
    public updateDevice(topic: string, node: Device) {
        const device = this.getDevice(topic)
        device.update(node)
    }

    /**
     * Searches the devices for a topic
     * @param topic 
     */
    public getDevice (topic: string): DeviceInfo | undefined {
        let result
        for(const device of this.devices) {
            if (device.topic === topic) {
                result = device
                break
            }
        }
        return result
    }

    /**
     * Replace the device info
     */
    replaceDevice (topic: string, node: StorageNode) {
        let device = this.getDevice(topic)
        if (device === undefined) {
            device = new DeviceInfo()
            this.devices.push(device)
        }
        device.update(node)
    }

}

