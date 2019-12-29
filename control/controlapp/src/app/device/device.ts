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

export interface History {
    time?: string;
    value?: string;
    reason?: Reason[]
}

export interface Device {
    name?: string
    topic?: string
    value?: string
    reason?: Reason[]
    history?: History[]
    actions?: string[]
    properties?: string[]
}
 
/**
 * Node of the device tree
 */
export interface StorageNode extends Device{
     childs: { [key:string]: StorageNode }
}


/**
 * Information structure for a device coming from the server
 */
interface DeviceInfo {
    topic: string
    time: string
    value: string
    reason?: Reason[]
    history?: History[]
}

/**
 * Payload read from server
 */
export interface Payload {
    childs: { [key:string]: DeviceInfo }
}

 /**
  * Device storage
  */
 @Injectable({
    providedIn: 'root',
})
export class DeviceStorage {

    tree : StorageNode = { childs: {} }

    /**
     * Updates the device
     * @param topic topic of the device
     * @param device the device object
     * @param data data read from server
     */
    updateDevice(topic: string, device: Device, deviceInfo: DeviceInfo): Device {
        if (deviceInfo) {
            if (deviceInfo.topic === topic) {
                const value = deviceInfo.value
                if (device.actions.includes('on')) {
                    const isOn = (value === 'on' || value === 'true' || Number(value) > 0)
                    device.value = isOn ? 'on' : 'off'
                } else {
                    device.value = value
                }
            }
            if (Array.isArray(deviceInfo.reason)) {
                device.reason = deviceInfo.reason
            }
            if (Array.isArray(deviceInfo.history)) {
                device.history = []
                for (let entry of deviceInfo.history) {
                    if (!entry.reason) {
                        entry.reason = [ { message: "As before - compressed", timestamp: entry.time } ]
                    }
                    device.history.push(entry)
                }
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

    /**
     * Replace the device info
     */
    replaceDevice (topic: string) {
        const device = this.getDevice(topic)
        const node = this.getNode(topic)
        if (node !== undefined) {
            const value = node.value
            if (device.actions.includes('on')) {
                const isOn = (value === 'on' || value === 'true' || Number(value) > 0)
                device.value = isOn ? 'on' : 'off'
            } else {
                device.value = value
            }
            if (Array.isArray(node.reason)) {
                device.reason = node.reason
            }
            if (Array.isArray(node.history)) {
                device.history = node.history
            }
        }
    }

    /**
     * Searches for a topic in a topic tree
     * @param topic topic string to find the right node
     * @returns node matching the topic or undefined if not found
     */
    private getNode(topic: string): StorageNode | undefined {
       let node = this.tree
       
       const topicChunks = topic.split('/')
       if (topicChunks[0] === '') {
           topicChunks.shift()
       }
       for (const topicChunk of topicChunks) {
            node = node.childs[topicChunk]
            if (node === undefined) {
               break
           }
       }
       return node
    }

    /**
     * Adds a node to the tree creating the needed tree structure
     * @param topic topic of the node
     */
    private addNode(topic: string): StorageNode {
       let node: StorageNode = this.tree
       const topicChunks: string[] = topic.split('/')
       if (topicChunks[0] === '') {
           topicChunks.shift()
       }
       for (const topicChunk of topicChunks) {
           if (node.childs[topicChunk] === undefined) {
               node.childs[topicChunk] = { childs: {} }
           } 
           node = node.childs[topicChunk]
       }
       return node
    }

    /**
     * Replaces (updates or inserts) a node in the tree
     * @param topic topic of the node
     * @param value value of the node
     * @param reason reason for the last value change
     */
    public replaceNode(topic: string, value: string, reason:Reason[], history?:History[]) {
        let node = this.addNode(topic)
        node.value = value
        node.reason = reason
        if (Array.isArray(history)) {
            node.history = history
        }
    }
    
    /**
     * Replaces many nodes by data read from server
     * @param payload data read from server
     */
    public replaceMany(payload: Payload) {
        if (payload) {
            for (let topic in payload) {
                if (typeof(topic) === 'string' && topic !== '') {
                    let info = payload[topic]
                    this.replaceNode(info.topic, info.value, info.reason, info.history);
                }
            }
        }
    }
}

