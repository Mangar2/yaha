/**
 * ---------------------------------------------------------------------------------------------------
 * This software is licensed under the GNU LESSER GENERAL PUBLIC LICENSE Version 3. It is furnished
 * "as is", without any support, and with no warranty, express or implied, as to its usefulness for
 * any purpose.
 *
 * File:      connect.js
 * Purpouse:
 * connect, disconnect, subscribe or unsubscribe to a http based "mqtt-like" broker
 * 
 * Author:      Volker Böhm
 * Copyright:   Volker Böhm
 * Version:     1.0
 * ---------------------------------------------------------------------------------------------------
 */

'use strict';

const HttpClient = require('@mangar2/httpclient');
const os = require('os');

/**
 * Gets the IP v4 address of the current device
 * @returns {string} IP v4 address
 */
function getIPv4Address() {
    let networkInterfaces = os.networkInterfaces();
    let address;
    for (let network in networkInterfaces) {
        let networkInterface = networkInterfaces[network];
        networkInterface.forEach(function(info) {
            if ('IPv4' === info.family && info.internal === false) {
                address = info.address;
            }
        });
    }
    return address;
}


module.exports = class Connect {
 
    /**
     * Organises connections to broker
     * @param {string} clientId id of this client
     * @param {string} brokerHost hostname (or ip) of the broker
     * @param {number} brokerPort port of the broker
     * @param {number} listenerPort port to listen for published messages from broker
     */
    constructor(clientId, brokerHost, brokerPort, listenerPort) {
        this.clientId = clientId;
        this.listenerPort = listenerPort;;
        this.myAddress = getIPv4Address();
        this.isConnected = false;
        this.isSubscribed = false;
        this.client = new HttpClient(brokerHost, brokerPort);
        this.nextPacketId = 1;
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
     * Sends an object via put as application/json message
     * @param {string} path path for the http PUT
     * @param {object} payload data to be transported via. PUT
     */
    putJsonMessage(path, headers, payload) {
        if (headers['Content-Type'] === undefined) {
            headers['Content-Type'] = 'application/json';
        }
        return this.client.send(path, "put", payload, headers);
    }

    /**
     * Connects to the broker
     * @param {boolean} clean true, if a disconnect shall clean any connection information
     */
    async connect(clean) {
        let payload = {
            clientId: this.clientId,
            clean,
            host: this.myAddress,
            port: this.listenerPort
        }

        let result = await this.putJsonMessage("/connect", {}, payload);
        if (result.statusCode !== 200 || result.headers.packet !== "connack") {
            throw(Error("Unable to connect status code: " + result.statusCode + " packet: " + result.headers.packet));
        }

        this.isConnected = true;
        return JSON.parse(result.payload);
    }

    /**
     * Disconnects from the broker
     */
    async disconnect() {
        let payload = {
            clientId: this.clientId
        }
        let result = await this.putJsonMessage("/disconnect", {}, payload);

        if (result.statusCode >= 300) {
            throw(Error("Unable to disconnect status code: " + result.statusCode));
        }

        this.isConnected = false;
        return {};
    }

    /**
     * Subscribe to the broker
     * @param {object} topics topics to subscribe to {topic1: QoS1, topic2: QoS2, ...}
     */
    async subscribe(topics) {
        let payload = {
            clientId: this.clientId,
            topics
        }
        let packetid = this.providePacketId();
        let result = await this.putJsonMessage("/subscribe", {packetid}, payload);
        let headers = result.headers;

        if (result.statusCode !== 200 || headers.packet !== "suback" || packetid != headers.packetid) {
            throw(Error("Unable to subscribe status code: " + statusCode + " headers " + JSON.stringify(headers)));
        }

        return JSON.parse(result.payload);
    }

    /**
     * Subscribe to the broker
     * @param {object} topics topics to subscribe to {topic1: QoS1, topic2: QoS2, ...}
     */
    async unsubscribe(topics) {
        let payload = {
            clientId: this.clientId,
            topics
        }
        let result = await this.putJsonMessage("/unsubscribe", {}, payload);

        if (result.statusCode >= 300 || result.headers.packet !== "unsuback") {
            throw(Error("Unable to unsubscribe status code: " + result.statusCode));
        }

        return {};
    }

    /**
     * First connect, then subscribe
     * @param {boolean} clean true, if a disconnect shall clean any connection information
     * @param {object} topics topics to subscribe to {topic1: QoS1, topic2: QoS2, ...}
     */
    async connectAndSubscribe(clean, topics) {
        let result;
        await this.connect(clean);
        if (this.isConnected) {
            result = await this.subscribe(topics);
        }
        return result;
    }


    /**
     * Closes the connection to the broker
     * @param {function} callback callback called on broker response
     */
    async close() {
        await this.client.close();
    }


}

