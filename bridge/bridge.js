/**
 * ---------------------------------------------------------------------------------------------------
 * This software is licensed under the GNU LESSER GENERAL PUBLIC LICENSE Version 3. It is furnished
 * "as is", without any support, and with no warranty, express or implied, as to its usefulness for
 * any purpose.
 *
 * File:      broker.js
 *
 * Author:      Volker Böhm
 * Copyright:   Volker Böhm
 * Version:     1.0
 * ---------------------------------------------------------------------------------------------------
 */

'use strict';
const Receive = require("@mangar2/receive")
const Publish = require("@mangar2/publish");
const UnitTest = require("@mangar2/unittest");
const Message = require("@mangar2/message");
const Connect = require("@mangar2/connect");
const shutdown = require("@mangar2/shutdown");
const Broker = require("@mangar2/broker");
const TopicStore = require("@mangar2/topicstore");

const HOST = "192.168.0.4";
const PORT = 8183;
const MY_PORT = 9002;

let connect = new Connect("/broker/client", HOST, PORT, MY_PORT);
let publish = new Publish(HOST, PORT, { retry: 10});
let receive = new Receive(MY_PORT);
let store = new TopicStore();
let amount = 0;

receive.on("publish", (message, qos, dup) => {
    console.log("%s (qos%s), value:%s, dup:%s", message.topic, qos, message.value, dup);
    store.addData(message.topic, message.value, message.reason);
    amount++;
    if (amount % 20 == 0) {
        store.persist("./", "bridge")
    }
});

async function connectToBroker(clean) {
    let version = '0.0';
    let topics = {
        '#' : 0
    }
    try {
        await connect.connectAndSubscribe(clean, topics, version);
    }
    catch(err) {
        console.log(err);
    }
}

connectToBroker(true);
receive.listen();