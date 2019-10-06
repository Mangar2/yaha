/**
 * ---------------------------------------------------------------------------------------------------
 * This software is licensed under the GNU LESSER GENERAL PUBLIC LICENSE Version 3. It is furnished
 * "as is", without any support, and with no warranty, express or implied, as to its usefulness for
 * any purpose.
 *
 * File:      log.js
 *
 * Author:      Volker Böhm
 * Copyright:   Volker Böhm
 * Version:     1.0
 * ---------------------------------------------------------------------------------------------------
 */

'use strict'

const TopicMatch = require("@mangar2/topicmatch");

module.exports = class Log {
    constructor() {
        this.logPattern = new TopicMatch();
    }

    changePatternByHTTP(body, res) {
        try {
            this.logPattern.changePattern(body);
            res.writeHead(200, {'Content-Type': 'text/plain'});
            res.end("ok");
        } catch (err) {
            res.writeHead(400, {'Content-Type': 'text/plain'});
            res.end("bad format " + err);
        }
    }

    logMessage(message, headers) {
        let topic = message.topic;
        if (this.logPattern.getBestMatchingPattern(topic, (newVal, curVal) => {return newVal > curVal})) {
            let value = message.value;
            let QoS = headers.qos;
            console.log("%s %s = %s (QoS:%s)", new Date().toLocaleString(), topic, value, QoS);
        }
    }
}