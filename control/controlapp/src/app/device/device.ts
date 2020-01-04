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
import { ReasonToTextPipe } from './reason-pipe';

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
export interface StorageNode extends Device{
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
     * Updates a device, changing some of its attributes
     * @param node node having device attributes
     */
    update(node: Device = undefined) {
        if (node !== undefined)  {
            const topicChunks = node.topic !== undefined ? node.topic.split('/') : []
            for (const property of ['topic', 'name', 'value', 'reason', 'history', 'actions', 'properties', 'pictures']) {
                this[property] = node[property]
            }
            if (this.actions !== undefined && this.actions.includes('on')) {
                const isOn = (this.value === 'on' || this.value === 'true' || Number(this.value) > 0)
                this.value = isOn ? 'on' : 'off'
            } 
            if (this.name !== undefined) {
                for (let i = 1; i <= 5; i++) {
                    this.name = this.name.replace('[' + i + ']', topicChunks[i - 1])
                }
            } else {
                const topicArray = this.topic.split('/')
                this.name = topicArray.pop()
            }
            if (!Array.isArray(this.reason)) {
                this.reason = []
            }
        }
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

 /**
  * Device storage
  */
 @Injectable({
    providedIn: 'root',
})
export class DeviceStorage {

    tree : StorageNode = { childs: {} }

    /**
     * Checks, if the storage is empty
     */
    public isEmpty() {
        return this.tree === undefined || Object.keys(this.tree.childs).length === 0
    }

    /**
     * Searches for a topic in a topic tree and return all matching nodes
     * @param topicChunks topic chunk-array to find the right node, supports '%' wildchard
     * @param node current node in the StorageNode tree
     * @returns array of matching nodes (may be empty)
     */
    private getNodesRec(topic: string, topicChunks: string[], node: StorageNode): StorageNode[] {
        let result = []
        const topicChunk = topicChunks[0]
        const childChunks = [...topicChunks]
        const hasChilds = node !== undefined && Object.keys(node.childs).length !== 0
        if (topicChunk !== '#') {
            childChunks.shift()
        } 

        if (node === undefined) {
            result = []
        } else if (topicChunk === undefined) {
            node.topic = topic
            result = [node]
        } else if (!hasChilds && topicChunk === '#') {
            node.topic = topic
            result = [node]
        } else if (topicChunk === '%' || topicChunk === '#') {
            for (const childChunk in node.childs) {
                const childNode = node.childs[childChunk]
                const childTopic = topic === '' ? childChunk : topic + '/' + childChunk
                const childResult = this.getNodesRec(childTopic, childChunks, childNode)
                result = [...result, ...childResult]
            }
        } else if (typeof(topicChunk) === 'string') {
            const childNode = node.childs[topicChunk]
            const childTopic = topic === '' ? topicChunk : topic + '/' + topicChunk
            const childResult = this.getNodesRec(childTopic, childChunks, childNode)
            result = [...result, ...childResult]
        }
        return result
    }

    /**
     * Searches for a topic in a topic tree and return all matching nodes
     * @param topic topic string to find the right node, supports '%' and '#' wildchard
     * @returns nodes matching the topic or undefined if not found
     */
    public getNodes(topic: string): StorageNode[] {
        const topicChunks = topic.split('/')
        if (topicChunks[0] === '') {
            topicChunks.shift()
        }
        const result =  this.getNodesRec('', topicChunks, this.tree)
        return result
    }

    /**
     * Gets a list of topic chunks of the childs
     * @param topic topic to select the child
     * @returns a list of topic chunks of the childs
     */
    getTopicMenu(topic: string): string[]
    {
        const nodes = this.getNodes(topic)
        const childs = Array.isArray(nodes) && nodes.length > 0 ? nodes[0].childs : []
        const result = []
        for (const child in childs) {
            if (child !== 'set' && !child.startsWith('unknown')) {
                result.push({ name: child })
            }
        }

        return result
    }

    /**
     * Searches recursively in the tree for nodes with the right properties
     * @param topic current topic
     * @param node node to start with
     * @param properties list of properties to select nodes (OR syntax). If empty, all nodes are selected
     * @param isRoot true, if the current node is the initial node of the search
     * @returns nodes matching the topic
     */
    private filterNodesRec(topic: string, node: StorageNode, properties: string[], isRoot: boolean = false): StorageNode[] {
        
        let intersect = properties === undefined || properties.length === 0 
        if (node.properties !== undefined && properties !== undefined) {
            const intersectArray = properties.filter(value => node.properties.includes(value))
            intersect = intersectArray.length > 0
        }
        const lastChunk = topic.split('/').pop()
        // 
        // 'set' commands are not relevant, they are included in status reports
        const isSetTopic = lastChunk === 'set'
        const propertyIncludesSet = Array.isArray(properties) && properties.includes('set')
        const excludeSetTopic = (isSetTopic && !propertyIncludesSet)
        const hasValue = node.value !== undefined
        // all root nodes must be included
        const includeNode = (isRoot || (intersect && !excludeSetTopic)) && hasValue

        node.topic = topic
        let result = includeNode ? [node] : []
        
        for (const childChunk in node.childs) {
            const childNode = node.childs[childChunk]
            const childTopic = topic + '/' + childChunk
            const childResult = this.filterNodesRec(childTopic, childNode, properties)
            result = [...result, ...childResult]
        }
        return result
    }

    /**
     * Searches for a topic in a topic tree and return all matching nodes
     * @param topic topic string to find the right node, supports '%' and '#' wildchard
     * @param properties list of properties to select nodes (OR syntax). If empty, all nodes are selected
     * @returns nodes matching the topic or undefined if not found
     */
    public filterNodes(baseTopic: string, properties: string[]) {
        const startNode = this.getNodes(baseTopic)[0]
        let result = []
        if (startNode !== undefined) {
            result = this.filterNodesRec(baseTopic, startNode, properties, true)
        }
        return result
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
     * Updates a node-tree node
     * @param node node in tree to update
     * @param device new values
     */
    private updateNode(node: StorageNode, device: Device) {
        for (const property of ['name', 'value', 'reason', 'history', 'actions', 'properties', 'pictures']) {
            if (device[property] !== undefined) {
                node[property] = device[property]
            }
        }
        // Force a standard for formatting "on" and "off" for better control later
        if (node.actions !== undefined && node.actions.includes('on')) {
            const isOn = (node.value === 'on' || node.value === 'true' || Number(node.value) > 0)
            node.value = isOn ? 'on' : 'off'
        } 
        // Put at least time infos to the reason of history entries
        if (Array.isArray(node.history)) {
            for (const entry of node.history) {
                if (entry.reason === undefined) {
                    const timestamp = (new Date(entry.time)).toISOString()
                    const message = 'updated'
                    entry.reason = [{ timestamp, message }]
                }
            }
        }
    }
    
    /**
     * Updates one or more nodes identified by a device.topic
     * @param device new values for update including the "topic" to identify the nodes
     * The topic supports the wildchard '%' matching any topic chunk and '#' matching the rest
     */
    public updateNodes(device: Device) {
        if (device.topic !== undefined) {
            const nodes = this.getNodes(device.topic) 
            for (let node of nodes) {
                this.updateNode(node, device)
            }
        }
    }

    /**
     * Replaces (updates or inserts) a node in the tree
     * @param topic topic of the node
     * @param value value of the node
     * @param reason reason for the last value change
     */
    public replaceNode(device: Device) {
        if (device.topic !== undefined) {
            let node = this.addNode(device.topic)
            this.updateNode(node, device)
        }
    }
    
    /**
     * Replaces many nodes by data read from server
     * @param payload data read from server
     */
    public replaceManyNodes(payload: Payload) {
        if (payload) {

            for (let topic in payload) {
                if (typeof(topic) === 'string' && topic !== '') {
                    let info = payload[topic]
                    this.replaceNode(info);
                }
            }
        }
    }
}

