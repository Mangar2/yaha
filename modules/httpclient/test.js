/**
 * ---------------------------------------------------------------------------------------------------
 * This software is licensed under the GNU LESSER GENERAL PUBLIC LICENSE Version 3. It is furnished
 * "as is", without any support, and with no warranty, express or implied, as to its usefulness for
 * any purpose.
 *
 * File:        test.js
 * Purpouse:    test file for httpclient
 *
 * Author:      Volker Böhm
 * Copyright:   Volker Böhm
 * Version:     1.0
 * ---------------------------------------------------------------------------------------------------
 */

 'use strict'

 const HttpClient = require("@mangar2/httpclient");
 const errorLog = require('@mangar2/errorlog');
 const shutdown = require("@mangar2/shutdown");

 let client = new HttpClient("127.0.0.1", 9001);
 let client2 = new HttpClient("192.198.0.127", 9000);

 // Success, if http server is started too
(async () => {
    let header = {'Content-Type': 'application/json', packetId: 1, mqttpacket: "publish"};
    let result = await client.send("/clients", "GET", "test", header).catch(err => {
        errorLog(err);
        exit(1);
    });
    console.log(result);
})();

 // Success, if http server is started too
 (async () => {
    let header = {'Content-Type': 'application/json', packetId: 2, mqttpacket: "publish"};
    let result = await client2.send("/clients", "GET", "test", header).catch(err => errorLog(err));
    if (result !== undefined) {
        exit(1);
    }
})();

console.log("success");

shutdown(async () => {
    await client.close();
    await client2.close();
    process.exit(0);
});