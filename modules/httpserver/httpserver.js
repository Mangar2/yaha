/**
 * ---------------------------------------------------------------------------------------------------
 * This software is licensed under the GNU LESSER GENERAL PUBLIC LICENSE Version 3. It is furnished
 * "as is", without any support, and with no warranty, express or implied, as to its usefulness for
 * any purpose.
 *
 * File:      HTTPServer.js
 * Purpouse:
 * Creates a http server listening to a port. It supports the following callbacks. Register them with
 * on("event", callback)
 * get
 * put
 * post
 * patch
 * delete
 * closed (called, when server is closed)
 * listen (calles, when server starts to listen)
 *
 * Author:      Volker Böhm
 * Copyright:   Volker Böhm
 * Version:     1.0
 * ---------------------------------------------------------------------------------------------------
 */

'use strict';

const http = require('http');
const errorLog = require('@mangar2/errorlog');

module.exports = class HTTPServer {

    /**
     * creates a http server listening to a certain port
     * @param {number} port port to listen to
     */
    constructor(port) {
        this.port = port;
        this.sockets = {};
        this.nextSocketId = 0;
        this.server = undefined;
        this.callbacks = {};

        this.on('listen', () => {
            console.log("Intranet server listening on: http://localhost:%s", this.port);
        })
        this.on('closed', () => {
            console.log("Server closed");
        })
    }

    /**
     * Sets a callback
     * @param {string} event RESTful http verb (POST, GET, PUT, PATCH, DELETE)
     * @param {function} callback(payload, headers, path, res) 
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
     * Extracts the path from the http request structure and returns it as array
     * @param {object} req http reqest structure
     * @returns {array} path elements without host name
     */
    static getPath(req) {
        let url        = require('url').parse(req.url, true);
        let path       = decodeURI(url.pathname);
        return path;
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
     * Creates a http server listening
     * @param {number} port port to listen to
     */
    listen() {
        this.server = http.createServer((req, res) => {
            try {
                let method     = req.method.toLowerCase();
                let path = HTTPServer.getPath(req);
                let payload = ''; 

                req.on('data', (chunk) => {
                    payload += chunk;
                });
                req.on('end', () => {
                    this.invokeCallback(method, payload, req.headers, path, res);
                })
            } catch (err) {
                res.writeHead(400, {'Content-Type': 'text/plain'});
                res.end(typeof(err) === 'object' ? err.message : err);
                errorLog(err);
            }
        }).listen(this.port, () => {
            this.invokeCallback('listen');
        });

        this.server.on("connection", (socket) => {
            let socketId = this.nextSocketId;
            this.nextSocketId++;
            this.sockets[socketId] = socket;
    
            socket.on('close', () => {
                delete this.sockets[socketId];
            });
        });

    }

    /**
     * Stops the server from accepting new connections and closes existing connections.
     * Calls the callback "close", once the server is closed.
     * @returns {promise} resolved, once the connection is closed
     */
    close() {
        let result = new Promise((resolve, reject) => {
            this.server.close(() => {
                this.invokeCallback('closed');
                resolve();
            });
            // destroy all open connections. The server only closes, if all socket connections are destroyed
            for (let socketId in this.sockets) {
                this.sockets[socketId].destroy();
            }
        })
        return result;
    }

}
