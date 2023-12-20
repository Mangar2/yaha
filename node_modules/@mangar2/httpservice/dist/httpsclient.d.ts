/**
 * @license
 * This software is licensed under the GNU LESSER GENERAL PUBLIC LICENSE Version 3. It is furnished
 * "as is", without any support, and with no warranty, express or implied, as to its usefulness for
 * any purpose.
 *
 * @author Volker Böhm
 * @copyright Copyright (c) 2020 Volker Böhm
 */
declare const https: any;
declare const Client: any;
/**
 * @description
 * Class simplifying access to the node http service for http clients
 * @param {string} host host name or ip address
 * @param {string|number} port port number
 * @example
 * client.sendv2({ path: 'info/getdata/1', method: 'GET' })
 * client.post({ path: 'postdata/1', payload={info: 'hello world')}, type='json' })
 * client.get('info/getdata/1')
 */
declare class HttpSClient {
    constructor(host: any, port: any);
    /**
      * Sends data. A payload of type "object" is automatically stringified, a string is not
      * @param {string} path http path
      * @param {string} method http send method PUT, GET, ...
      * @param {string|object} payload payload to send
      * @param {object} [headers={}] header to send
      * @returns {Promise<{statusCode, headers, payload}>} Promise; resolve = {statusCode, headers, payload}
      */
    send(path: any, method: any, payload: any, headers?: {}): any;
    /**
     * Sends data. Adds a content-type element to the header and stringifies the boy based on the type
     * @param {object} sendOptions all information required for sending
     * @param {string} sendOptions.path http path
     * @param {string} sendOptions.method http send method PUT, GET, ...
     * @param {object} [sendOptions.payload] payload to send
     * @param {object} [sendOptions.headers={}] header to send
     * @param {string} [type] type of the payload data: html, text, json, form, xml
     * @returns {Promise<{statusCode, headers, payload}>} Promise; resolve = {statusCode, headers, payload}
     */
    sendv2(sendOptions: any): any;
    /**
     * Sends a post request
     * @param {object} sendOptions all information required for sending
     * @param {string} sendOptions.path http path
     * @param {object} [sendOptions.payload] payload to send
     * @param {object} [sendOptions.headers={}] header to send
     * @param {string} [type] type of the payload data: html, text, json, form, xml
     * @returns {Promise<{statusCode, headers, payload}>} Promise; resolve = {statusCode, headers, payload}
     */
    post(sendOptions: any): any;
    /**
     * Sends a put request
     * @param {object} sendOptions all information required for sending
     * @param {string} sendOptions.path http path
     * @param {object} [sendOptions.payload] payload to send
     * @param {object} [sendOptions.headers={}] header to send
     * @param {string} [type] type of the payload data: html, text, json, form, xml
     * @returns {Promise<{statusCode, headers, payload}>} Promise; resolve = {statusCode, headers, payload}
     */
    put(sendOptions: any): any;
    /**
     * Sends a get request
     * @param {string} path http path
     * @param {object} [headers={}] header to send
     * @returns {Promise<{statusCode, headers, payload}>} Promise; resolve = {statusCode, headers, payload}
     */
    getRequest(path: any, headers?: {}): any;
    /**
     * Aborts all open requests
     * @returns {promise} resolved once all connections are closed
     */
    close(): any;
}
