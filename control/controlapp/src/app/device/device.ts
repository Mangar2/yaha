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
import { devices } from '../devices';

export interface Reason {
    timestamp: string;
    message: string;
}

export interface Message {
    topic?: string;
    value: string | number;
    reason?: Reason[];
}

export interface Device {
    name?: string;
    topic?: string;
    value?: string;
    reason?: Reason[];
    history?: Message[];
    actions?: string[];
    properties?: string[];
}

 /**
  * Device storage
  */
 @Injectable({
    providedIn: 'root',
})
export class DeviceStorage {
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
                if (device.actions.includes('on')) {
                    const isOn = (value === 'on' || value === 'true' || value === true || Number(value) > 0)
                    device.value = isOn ? 'on' : 'off'
                } else {
                    device.value = value
                }
            }
            if (Array.isArray(data.payload.current.reason)) {
                device.reason = data.payload.current.reason
            }
            if (Array.isArray(data.payload.history)) {
                device.history = data.payload.history
            }
        }
        return device
    }

    /**
     * Searches the devices for a topic
     * @param topic 
     */
    getDevice (topic: string): Device | undefined {
        let result
        for(const device of devices) {
            if (device.topic === topic) {
                result = device
                break
            }
        }
        return result
    }
}

