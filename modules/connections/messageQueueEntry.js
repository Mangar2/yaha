/**
 * ---------------------------------------------------------------------------------------------------
 * This software is licensed under the GNU LESSER GENERAL PUBLIC LICENSE Version 3. It is furnished
 * "as is", without any support, and with no warranty, express or implied, as to its usefulness for
 * any purpose.
 *
 * File:        MessageQueueEntry.js
 * Purpouse:    Slot of a queue holding a message to transmit
 *
 * Author:      Volker Böhm
 * Copyright:   Volker Böhm
 * Version:     1.0
 * ---------------------------------------------------------------------------------------------------
 */

'use strict'
const assert = require("assert");

module.exports = class MessageQueueEntry {
    /**
     * 
     * @param {Number} QoS quality of service (0, 1 or 2)
     * @param {any} payload
     */
    constructor(QoS, payload) {
        assert((QoS >= 0 && QoS <= 2), "QoS must be a number 0,1 or 2");
        // Quality of service to transmit the payload
        this.QoS = QoS;
        // Any payload
        this.payload = payload;
        // Unique id to identify the entry (optional)
        this.id = undefined;
        // Timestamp the payload was transmitted
        this.transmitTimestamp = 0;
        // Status of the entry
        this.status = "new";
        // Amount of retries to transmit the playload
        this.retryCount = 0;
    }

    /**
     * Sets the identifier for the entry
     * @param {Number} id unique entry identifier
     */
    setId(id) {
        this.id = id;
    }

    /**
     * increases the retry counter and stores the actual timestamp
     */
    startTransmission() {
        let now = (new Date()).getTime();
        this.transmitTimestamp = now;
        this.retryCount++;
    }

    getPayload() { return this.payload; }
    getId() { return this.id; }
    getQoS() { return this.QoS; }

}