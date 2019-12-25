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



/**
 * Reason structure describing the reason of an action
 */
interface Reason {
    timestamp: string,
    message: string
}

/**
 * History structure describing the history of the node
 */
interface History {
    value: string,
    reason: Reason[]
}
 
/**
 * Node of the device tree
 */
export interface StorageNode {
     value?: string
     reason?: Reason[]
     history?: History
     childs: { [key:string]: StorageNode }
 }

 /**
  * Device storage
  */
 @Injectable({
    providedIn: 'root',
})
export class DeviceStorage {
     
     tree: StorageNode = { childs: {} }

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
            node = node.childs[topicChunk]
            if (node === undefined) {
                node = node.childs[topicChunk] = { childs: {} }
            } 
        }
        return node
     }

     /**
      * Replaces (updates or inserts) a node in the tree
      * @param topic topic of the node
      * @param value value of the node
      * @param reason reason for the last value change
      */
     public replaceNode(topic: string, value: string, reason:Reason[], history?:History) {
         let node = this.addNode(topic)
         node.value = value
         node.reason = reason
         if (history) {
             node.history = history
         }
     }

 }
 