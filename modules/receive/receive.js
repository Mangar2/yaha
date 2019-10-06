/**
 * ---------------------------------------------------------------------------------------------------
 * This software is licensed under the GNU LESSER GENERAL PUBLIC LICENSE Version 3. It is furnished
 * "as is", without any support, and with no warranty, express or implied, as to its usefulness for
 * any purpose.
 *
 * File:      receive.js
 *
 * Author:      Volker Böhm
 * Copyright:   Volker Böhm
 * ---------------------------------------------------------------------------------------------------
 */

'use strict';

const Log = require('./log.js');
const CheckInput = require('./checkInput.js');
const Server = require('@mangar2/httpserver');

var checkMessage = new CheckInput({
    type: 'object',
    properties: {
        topic: {type: 'string'},
        value: {type: 'string'},
        reason: {
            type: 'array',
            items: {
                type: 'object',
                properties: {
                    message: {type: 'string'},
                    timestamp: {type: 'string'}
                },
                required: ['message']
            }
        }
    },
    required: ['topic', 'value']
});

var checkPublishHeader = new CheckInput({
    type: 'object',
    properties: {
        packetid: {
            type: 'number',
            minimum: 0,
            maximum: 65536
        }
    }
});

module.exports = class Receive {
    
    /**
     * Creates a new server receiving messages
     * @param {number} listenerPort port to listen on
     */
    constructor(listenerPort) {
        this.log = new Log();
        this.server = new Server(listenerPort);
        this.callbacks = {};
        let result;

        this.server.on("PUT", (payload, headers, path, res) => {
            if (path === "/publish") {
                result = this.onPublish(JSON.parse(payload), headers, res);
            } else if (path === "/log") {
                result = this.onLog(JSON.parse(payload), headers, res);
            } else {
                throw("illegal interface " + path);
            }
        })
        return result;
    }

    /**
     * Starts to listen and wait for input
     */
    listen() {
        this.server.listen();
    }

    /**
     * Callcs a callback stored to an event, if registered
     * @param {string} event event for callback
     * @param  {...any} param parameters to pass to the callback
     */
    invokeCallback(event, ...param) {
        if (this.callbacks[event] !== undefined) {
            this.callbacks[event](...param);
        }
    }

    /**
     * Sets a callback
     * @param {string} event RESTful http verb (POST, GET, PUT, PATCH, DELETE)
     * @param {function} callback(payload, qos) 
     * where payload is the http payload, headers the http headers, res the result structure and path is 
     * is the http path as string
     */
    on(event, callback) {
        let eventLowerCase = event.toLowerCase();
        if (typeof(callback === 'function')) {
            this.callbacks[eventLowerCase] = callback;
        }
    }

    /**
     * Receives a published message
     * @param {Message} message received
     * @param {object} headers headers of the message
     * @param {object} res http result structure
     */
    onPublish(message, headers, res) {
        if (!checkMessage.check(message)) {
            throw("illegal message format " + JSON.stringify(message, null, 2));
        }
        if (!checkPublishHeader.check(headers)) {
            throw("Illegal header " + JSON.stringify(headers, null, 2));
        }
        this.invokeCallback("publish", message, headers.qos);
        let packet = 'PUBACK';
        let resultHeaders = {'Content-Type': 'application/json', packet}
        if (headers.packetid !== undefined) {
            resultHeaders.packetid = headers.packetid;
        }
        res.writeHead(204, resultHeaders);
        res.end('');
    }

    /**
     * Receives a logging request
     * @param {topics} topics received
     * @param {object} headers headers of the message
     * @param {object} res http result structure
     */
    onLog(topics, headers, res) {
        res.writeHead(204, {'Content-Type': 'application/json'});
        res.end('');
    }
}

