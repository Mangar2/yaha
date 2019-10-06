
/**
 * ---------------------------------------------------------------------------------------------------
 * This software is licensed under the GNU LESSER GENERAL PUBLIC LICENSE Version 3. It is furnished
 * "as is", without any support, and with no warranty, express or implied, as to its usefulness for
 * any purpose.
 *
 * File:        message.js
 * Purpouse:    Message used in home automation.
 *              Topic: MQTT formatted topic
 *              Value: new value of the topic (example: "on" or "off" or 1 ..)
 *              Reason: Array of reason entries. This is used to store all incidents along the 
 *              path of the message through the automation system. As a result we get a full
 *              trace for each action/message from creation reason to the full flow to the devices
 *              and their acknowledges.
 *
 * Author:      Volker Böhm
 * Copyright:   Volker Böhm
 * Version:     1.0
 * ---------------------------------------------------------------------------------------------------
 */

 class Message {

    /**
     * creates a new message
     * @param {string} topic topic string
     * @param {string} value value to set topic to
     * @param {string} reason explaining, why the topic will be set to value
     * @param {Date} now current time
     */
    constructor(topic, value, reason, now) {
        this.topic = topic;
        this.value = value;
        if (typeof(reason) === 'string') {
            this.addReason(reason, now);
        } else {
            this.reason = reason;
        }
        this.checkAllAttributes();

    }

    /**
     * Adds a reason to the reason array
     * @param {string} reason explaining, why the topic will be set to value
     * @param {Date|undefined} now current time. If not provided, it will be calculated. 
     *                         usually only passed for debugging reasons.
     */
    addReason(reason, now) {
        if (now === undefined) {
            now = new Date();
        }
        if (!Array.isArray(this.reason)) {
            this.reason = [];
        }
        this.reason.push({
            message: reason,
            timestamp: now.toISOString()
        });
    }

    /**
     * Gets the latest Date of the message by browsing the reasons
     * @returns {Date} 
     */
    getDateOfNewestChange() {
        var time;
        if (this.reason !== undefined) {
            for (let element of this.reason) {
                let timestamp = element.timestamp;
                if (timestamp !== undefined) {
                    time = new Date(timestamp);
                    break;
                }
            }
        }
        return time;
    }

    /**
     * Checks the existence of the attributes value, reason, topic. Throws error, if any is not existant
     * @throws {error}
     */
    checkAllAttributes() {
        if (this.topic === undefined) {
            throw error("missing value in message ");
        }

        if (this.value === undefined) {
            throw error("missing value in message ");
        }

        if (this.reason === undefined) {
            throw error("missing reason in message ");
        }
    }

 }

module.exports = Message;