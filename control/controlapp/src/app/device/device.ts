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
import { ɵangular_packages_platform_browser_dynamic_platform_browser_dynamic_a } from '@angular/platform-browser-dynamic';
import { StringMapWithRename } from '@angular/compiler/src/compiler_facade_interface';

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
    name?: string
    topic?: string
    value?: string
    reason?: Reason[]
    history?: Message[]
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
 * Payload read from server
 */
interface Payload {

}

interface link {
    rel: string
    href: string
}

/**
 * Data read from server
 */
interface ServerData {
    links: link[]
    payload: Payload
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
    updateDevice(topic: string, device: Device, data: any): Device {
        if (data && data.payload && data.payload.current) {
            this.replaceMany(data.payload)
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
    public replaceNode(topic: string, value: string, reason:Reason[], history?:Message[]) {
        let node = this.addNode(topic)
        node.value = value
        node.reason = reason
        if (Array.isArray(history)) {
            node.history = history
        }
    }
    
    /**
     * Replaces many nodes by data read from server
     * @param data data read from server
     */
    public replaceMany(payload: any) {
        if (payload && payload.current) {
            this.replaceNode(payload.current.topic, payload.current.value, payload.current.reason, payload.history);
        }
        for (let index in payload) {
            if (index !== 'current' && index !== 'statistics' && index !== 'history' && index !== 'set') {
                const child = payload[index]
                this.replaceMany(child)
            }
        }
    }
}

