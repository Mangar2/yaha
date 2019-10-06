/**
 * ---------------------------------------------------------------------------------------------------
 * This software is licensed under the GNU LESSER GENERAL PUBLIC LICENSE Version 3. It is furnished
 * "as is", without any support, and with no warranty, express or implied, as to its usefulness for
 * any purpose.
 *
 * File:      publish.js
 * Purpouse:  Publishes a message to a http based mqtt broker. Use only "publish" and "close" 
 * all other methods are private.
 *
 * Author:      Volker Böhm
 * Copyright:   Volker Böhm
 * Version:     1.0
 * ---------------------------------------------------------------------------------------------------
 */

'use strict';

const HttpClient = require('@mangar2/httpclient');

/**
 * Converts a QoS to a valid QoS. (0,1,2) by converting it to Number and setting it to "0" on any invalid entry
 * @param {Number|string} qos QoS to transform
 * @return {Number} valid QoS
 */
function convertQoSToValidQoS(qos) {
    var numberQoS = Number(qos);
    if (numberQoS != 1 && numberQoS != 2) {
        numberQoS = 0;
    }
    return numberQoS;
}


/**
 * Waits for a period of milliseconds
 * @param {number} timeoutInMilliseconds timeout of the delay in milliseconds
 * @returns {Promise} 
 */
function delay(timeoutInMilliseconds) {
    return new Promise(resolve => {
    setTimeout(() => {
        resolve();
    }, timeoutInMilliseconds);
    });
}


module.exports = class PublishMessage {

    /**
     * 
     * @param {string} host host name (or ip)
     * @param {number} port port number
     * @param {{retry}} configuration configuration options, retry: amount of tries to send a message
     */
    constructor(host, port, configuration) {
        if (typeof(configuration) !== 'object') {
            configuration = {};
        }
        this.topicQueues = {}
        this.client = new HttpClient(host, port);
        this.nextPacketId = 1;
        this.configuration = {};
        this.configuration.retry = !isNaN(configuration.retry) ? configuration.retry : 60;
        this.terminate = false;
    }

    /**
     * provides a new packet id
     * @returns {number} "nearly unique" packet id (between 0 .. 65536)
     */
    providePacketId() {
        let packetid = this.nextPacketId;
        this.nextPacketId++;
        this.nextPacketId %= 0x10000; 
        if (this.nextPacketId === 0) {
            this.nextPacketId = 1;
        }
        return packetid;
    }

    /**
     * sends a pubrel packet to support QoS 2
     * @param {number} packetid packet id of the publish packet that is acknowledged with pubrel
     * @param {string} topic topic name
     */
    async pubrel(packetid, topic) {
        let headers = {packetid};
        let success = false;
        let retryCount = 0;

        while (!success && retryCount < this.configuration.retry) {
            this.topicQueues[topic].state = "pubrel";
            try {
                result = await this.client.send("/pubrel", "PUT", {}, headers);
                let packet = result.headers.packet.toLowerCase();
                let packetIdMatches = headers.packetid === result.headers.packetid;
                success = result.statusCode < 300 && packet === "pubcomp" && packetIdMatches;
            }
            catch (err) {
                // success === false; No need to change anything, retry
            }
            await delay(1000 * Math.min(retryCount * retryCount, 60));
            retryCount++;
        }
        return success;
    }

    /**
     * Checks, if a publish call is successful
     * @param {number} statusCode http status code
     * @param {number} qos quality of service
     * @param {boolean} packetIdMatches true, if the package id matches
     * @param {string} packet received packet name
     */
    isPublishSuccessful(statusCode, qos, packetIdMatches, packet) {
        let success = false;
        let statusOk = statusCode < 300;
        switch (qos) {
            case 0: success = true; break;
            case 1: success = statusOk && packet === "puback" && packetIdMatches; break;
            case 2: success = statusOk && packet === "pubrec" && packetIdMatches; break;
            default: success = true; // invalid qos, should not happen
        }
        return success;
    }

    /**
     * Publishes a message with a defined quality of service automatically generating an id
     * @param {object} message message to publish.
     * @param {number} qos 0,1,2 quality of service
     * @param {number} retain 0 (false) or 1 (true). True, if message shall be retained for future subscriptions
     * @throws {string} on any connection error
     */
    async publish(message, qos, retain) {
        qos = convertQoSToValidQoS(qos);
        let headers = {qos, dup: 0, retain}
        let result; 

        if (qos === 0) {
                // Do not care, if send is successful for qos === 0
                this.client.send("/publish", "PUT", message, headers).catch();
        } else {
            if (this.topicQueues[message.topic] === undefined) {
                this.topicQueues[message.topic] = {state: "ready", queue: []};
            }
            let topicQueue = this.topicQueues[message.topic];
            topicQueue.queue.push({headers, message});
            
            if (topicQueue.state === "ready") {
                while (topicQueue.queue.length > 0) {
                    topicQueue.state = "publish";
                    let firstElement = topicQueue.queue.shift();
                    result = await this.sendMessage(firstElement.message, firstElement.headers);
                    topicQueue.state = "ready";
                }
            } 
        }
        return result;
    }

    /**
     * Internal function -> sends a message. Please call "publish"
     * @param {object} message message to publish
     * @param {object} headers headers structure
     * @throws {string} on any connection error
     */
    async sendMessage(message, headers) {
        let success = false;
        let qos = headers.qos;
        let retryCount = 0;
        let result;

        headers.packetid = this.providePacketId();
        
        while (!success && retryCount < this.configuration.retry) {
            try {
                result = await this.client.send("/publish", "PUT", message, headers);
                let packet = result.headers.packet.toLowerCase();
                let packetIdMatches = headers.packetid == result.headers.packetid;
                success = this.isPublishSuccessful(result.statusCode, qos, packetIdMatches, packet);   
            }
            catch (err) {
                // success === false; No need to change anything, we retry
            }
            headers.dup = 1;
            await delay(1000 * Math.min(retryCount * retryCount, 60));
            retryCount++;
        }

        if (qos === 2 && success) {
            success = await this.pubrel(headers.packetid, message.topic);
        }

        return success;
    }

    /**
     * Closes the connection to the broker
     * @param {function} callback callback called on broker response
     */
    async close() {
        this.terminate = true;
        await this.client.close();
    }
}
