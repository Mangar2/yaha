/**
 * ---------------------------------------------------------------------------------------------------
 * This software is licensed under the GNU LESSER GENERAL PUBLIC LICENSE Version 3. It is furnished
 * "as is", without any support, and with no warranty, express or implied, as to its usefulness for
 * any purpose.
 *
 * File:      httpclient.js
 * Purpouse:
 * Sends a http request to a http server
 * Usage client = new HttpClient(host, port)
 * client.send(path, method, payload, headers)
 * 
 * Author:      Volker Böhm
 * Copyright:   Volker Böhm
 * Version:     1.0
 * ---------------------------------------------------------------------------------------------------
 */

'use strict';

const http = require('http');

module.exports = class HttpClient {

    constructor(host, port) {
        this.setConnection(host, port);
        this.requests = {};
        this.nextRequestId = 0;
    }

    /**
     * Sets host name and port number
     * @param {string} host host name
     * @param {string} port port number
     */
    setConnection(host, port) {

        if (host === undefined) {
            throw Error("No host specified");
        }
        if (port === undefined) {
            throw Error("No port specified");
        }

        this.host = host;
        this.port = port;
    }

    /**
     * Sends data
     * @param {string} path http path
     * @param {string} method http send method PUT, GET, ...
     * @param {object} payload payload to send
     * @param {object} headers header to send
     */
    send(path, method, payload, headers) {
        
        let stringPayload = JSON.stringify(payload);
        headers['Content-Length'] = stringPayload.length;

        let options = {
            host: this.host,
            port: this.port,
            path,
            method,
            headers
        };
        let result = new Promise((resolve, reject) => {
            let requestId = this.nextRequestId;
            this.nextRequestId++;
            try {
                let request = http.request(options, res => {
                    let payload = "";
                    res.setEncoding('utf8');
                    res.on('data', chunk => payload += chunk);

                    res.on('end', () => {
                        let headers = res.headers;
                        let statusCode = res.statusCode;
                        resolve({statusCode, headers, payload});
                        delete this.requests[requestId];
                    });
                });
                this.requests[requestId] = request;
                request.write(stringPayload);
                request.end();
                request.on('error', err => {
                    reject(err);
                    delete this.requests[requestId];
                });

            } catch (err) {
                reject(err);
                delete this.requests[requestId];
            }
        });

        return result;
    };

    /**
     * Aborts all open requests
     */
    close() {
        let result = new Promise((resolve, reject) => {
            for (let requestId in this.requests) {
                this.requests[requestId].abort();
            }
            resolve();
        })
        return result;
    }
}

