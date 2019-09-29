const Connections = require("./connections");
const Message = require("@mangar2/message");

connections = new Connections({
    fileName: "connectionData", 
    directory: ".", 
    timeoutInMilliseconds:10,
    maxRetryCount:10
});

class UnitTest {
    constructor(verbose) {
        this.success = 0;
        this.fail = 0;
        this.testNo = 0;
        this.verbose = verbose;
    }

    showResult() {
        console.log("success: %s, failed: %s", this.success, this.fail);
    }

    assertTrue(test, message, verbose) {
        this.testNo++;
        if (test) {
            this.success++;
            if (verbose || verbose === undefined) {
                console.log("success: " + message);
            }
        } else {
            this.fail++;
            console.error("failed: " + test + " is not true " + message);
        }
    }

    assertEqual(param) {
        this.testNo++;
        let attrib = Object.keys(param);
        let a = param[attrib[0]];
        let b = param[attrib[1]];
        let text = param[attrib[2]];
        if (a == b) {
            this.success++;
            console.log("success: " + text);
        } else {
            this.fail++;
            console.error("failed: " + attrib[0] + "(" + a + ") != " + attrib[1] + "(" + b + ") " + text);
        }
    }

    delay(milliseconds) {
        return new Promise(resolve => setTimeout(resolve, milliseconds));
    }
    
}
var unitTest = new UnitTest(false);


Message0 = new Message("topic/0", "value0", "reason0");
Message1 = new Message("topic/1", "value1", "reason1");
Message2 = new Message("topic/2", "value2", "reason2");

function connect() {
    connections.connect("client0", "host0", "port0", false);
    connections.connect("client1", "host1", "port1", true);
}
function disconnect() {
    connections.disconnect("client0");
    connections.disconnect("client1");
}
function subscribe() {
    connections.subscribe("client0", {"topic/0": 0});
    connections.subscribe("client0", {"topic/1": 1});
    connections.subscribe("client0", {"topic/2": 2});
    connections.subscribe("client1", {"topic/0": 2, "topic/1": 0, "topic/2": 1});
}
function unsubscribe() {
    connections.unsubscribe("client0", "topic/1");
    connections.unsubscribe("client1", "#");
}
function queueMessages(retain) {
    connections.publishMessage(Message0, 0, retain);
    connections.publishMessage(Message1, 1, retain);
    connections.publishMessage(Message2, 2, retain);
}

let lastId = {};
function sendAllMessages(expectedMessages, errorText) {
    let receivedMessages = 0;
    connections.sendAllMessages((host, port, message, QoS, id, resultCallback) => {
        if (unitTest.verbose) {
            console.log("host %s, port %s, message %s, QoS %s, id %s", host, port, JSON.stringify(message), QoS, id);
        }
        if (QoS > 0) {
            resultCallback(id);
        }
        let topic = message.topic;
        if (lastId[host] === undefined) {
            lastId[host] = {};
        }
        _lastId = lastId[host][topic];
        if (id != undefined && _lastId !== undefined) {
            unitTest.assertTrue(id >= _lastId, "topic: " + topic + " " + id + " >= " + _lastId, false);
        }
        lastId[host][topic] = id;
        receivedMessages++;
    });
    unitTest.assertEqual({expectedMessages, receivedMessages, errorText});
}

/**
 * Sends all messages, but does not inform about the result
 */
function sendAllMessagesNotCallingResultCallback() {
    connections.sendAllMessages((host, port, message, QoS, id, resultCallback) => {});
}

(async () => {    
    /**
     * Test connecting
     */
    connect();
    subscribe();
    queueMessages();
    sendAllMessages(6, "test subscribed");
    sendAllMessages(0, "test subscribed, messages sent")

    /**
     * Test disconnect
     */
    connect();
    subscribe();
    queueMessages();
    disconnect();
    sendAllMessages(0, "test disconnected");
    connect();
    sendAllMessages(2, "test reconnect");

    /**
     * Test unsubscribe
     */
    connect();
    subscribe();
    unsubscribe();
    queueMessages();
    sendAllMessages(2, "test unsubscribe");

    /**
     * Test connecting
     */
    connect();
    subscribe();
    for (let i = 0; i < 10; i++) { 
        queueMessages(); 
    }
    sendAllMessagesNotCallingResultCallback();
    sendAllMessages(0, "in retry timeout");
    await unitTest.delay(15);
    for (let i = 0; i < 10; i++) {
        sendAllMessages(3, "after retry timeout");
    }
    sendAllMessages(0, "no message left");

    /**
     * Test auto disconnect
     */
    connect();
    subscribe();
    queueMessages();

    for (let i = 0; i <= 5; i++) {
        sendAllMessagesNotCallingResultCallback();
        await unitTest.delay(15);
    }
    sendAllMessages(3, "not yet disconnected");
    queueMessages();
    for (let i = 0; i <= 8; i++) {
        sendAllMessagesNotCallingResultCallback();
        await unitTest.delay(15);
    }
    // 3 messages, because client0 has two messages and client0 one
    sendAllMessages(3, "not yet disconnected");
    queueMessages();
    for (let i = 0; i <= 10; i++) {
        sendAllMessagesNotCallingResultCallback();
        await unitTest.delay(15);
    }
    sendAllMessages(0, "auto disconnected");
    connect();
    // Two messages, because client1 is clean after connect
    sendAllMessages(2, "reconnect after auto disconnect");

    /**
     * Test retain messages
     */
    const RETAIN = true;
    connect();
    subscribe();
    connections.publishMessage(new Message("topic/0", "", "reason0"), 0, RETAIN);
    sendAllMessages(2, "retain, receive message with empty value");
    queueMessages(RETAIN);
    sendAllMessages(6, "retain, receive messages normally");
    sendAllMessages(0, "retain, check no message left to send");
    subscribe();
    sendAllMessages(6, "retain, message received due to retain");
    disconnect();
    connect();
    sendAllMessages(0, "retain, no messages after reconnect");
    connections.publishMessage(new Message("topic/0", "", "reason0"), 0, RETAIN);
    connections.publishMessage(new Message("topic/1", "", "reason1"), 0, RETAIN);
    connections.publishMessage(new Message("topic/2", "", "reason2"), 0, RETAIN);
    sendAllMessages(3, "retain, send empty retain messages, one client is clean");
    subscribe();
    sendAllMessages(0, "retain, all retain messages deleted");

    /**
     * Test persistence
     */
    connect();
    subscribe();
    queueMessages();
    await connections.persist();
    sendAllMessages(6, "persisted");
    sendAllMessages(0, "all messages sent");
    disconnect();
    await connections.restoreClientsFromLastFile();
    sendAllMessages(6, "restored");

    unitTest.showResult();

})();

