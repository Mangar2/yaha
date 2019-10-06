/**
 * ---------------------------------------------------------------------------------------------------
 * This software is licensed under the GNU LESSER GENERAL PUBLIC LICENSE Version 3. It is furnished
 * "as is", without any support, and with no warranty, express or implied, as to its usefulness for
 * any purpose.
 *
 * File:        Connections.js
 * Purpouse:    Manage connections to the broker
 *
 * Author:      Volker Böhm
 * Copyright:   Volker Böhm
 * Version:     1.0
 * ---------------------------------------------------------------------------------------------------
 */

'use strict';

const Persist = require("@mangar2/persist");
const TopicMatch = require("@mangar2/topicmatch");
const Client = require("./client.js");
var persistConnections = new Persist();

module.exports = class Connections {


    constructor(configuration) {
        this.configuration = configuration;
        if (typeof(this.configuration.fileName) !== 'string') {
            throw Error("Filename missing in configuration");
        }
        if (typeof(this.configuration.directory) !== 'string') {
            throw Error("Directory missing in configuration");
        }
        if (typeof(this.configuration.inFlightWindow) !== 'number') {
            this.configuration.inFlightWindow = 1;
        }
        if (typeof(this.configuration.timeoutInMilliseconds) !== 'number') {
            this.configuration.timeoutInMilliseconds = 10 * 1000;
        }
        if (typeof(this.configuration.maxRetryCount) !== 'number') {
            this.configuration.timeoutInMilliseconds = 10;
        }

        
        this.logPattern = new TopicMatch();
        this.retainMessages = {};

        if (this.clients === undefined) {
            this.clients = {};
        }
    }

    /**
     * Restores all clients from last valid saved file
     */
    async restoreClientsFromLastFile() {
        let clientArray = persistConnections.readData(
            this.configuration.directory, this.configuration.fileName);

        for (let clientId in clientArray) {
            let clientData = clientArray[clientId];
            this.clients[clientId] = new Client(clientData);
        }
    }

    /**
     * Gets a client by id
     * @param {any} clientId id of the client
     * @param {boolean} create if true, a client is created, if no clientId available
     * @throws {Error} 
     */
    getClient(clientId, create) {
        if (clientId === undefined) {
            throw Error("Connect without client id (clientId)");
        }

        if (this.clients[clientId] === undefined && create) {
            this.clients[clientId] = new Client({clientId});
        }

        if (this.clients[clientId] === undefined) {
            throw Error("Unknown clientId " + clientId);
        }

        return this.clients[clientId];
    }

    /**
     * Persists all connections
     */
    async persist() {
        await persistConnections.saveObjectToFile(this.configuration.directory, this.configuration.fileName, this.clients);
    }


    /**
     * Connects a client (Stores a connection to a client)
     * @param {any} clientId id of the client
     * @param {string} host host name
     * @param {string} port port name
     * @param {bool} clean true, if the connection will be cleaned on disconnect
     * @returns {object} {mqttcode, present} present == 1, if an old session is recovered
     * @throws {Error} 
     */
    connect(clientId, host, port, clean) {
        let sessionAvailable = this.clients[clientId] === undefined;
        let present = !clean && sessionAvailable ? 1 : 0;
        let client = this.getClient(clientId, true);
        client.connect(clientId, host, port, clean);
        return {mqttcode: 0, present};
    }

    /**
     * Disconnects a client
     * @param {string} clientId id of the client
     * @throws {Error} 
     */
    disconnect(clientId) {
        let client = this.getClient(clientId, false);
        client.disconnect(clientId);
    }

    /**
     * Subscribes to topics
     * @param {string} clientId id of the client
     * @param {object} topics {QoS, topics} or {topic1: QoS1, topic2: QoS2, ...}
     * @returns {array} array of QoS values
     */
    subscribe(clientId, topics) {
        let client = this.getClient(clientId, false);
        // Retain messages are not supported for outdated style topics
        if (topics.topics === undefined) {
            let match = new TopicMatch(topics);
            for (let retainTopic in this.retainMessages) {
                let QoS = this.retainMessages[retainTopic].QoS;
                let message = this.retainMessages[retainTopic].message;
                client.publishMessage(message, QoS, false, match);
            }
        }
        return client.subscribe(clientId, topics);
    }

    /**
     * Unsubsribes to topics
     * @param {string} clientId id of the client
     * @param {array} topics array of topics strings (topic with wildchars '+' and '#')
     */
    unsubscribe(clientId, topics) {
        let client = this.getClient(clientId, false);
        client.unsubscribe(clientId, topics);
    }
    
    /**
     * Adds messages that needs to be published
     * @param {object} message message to add to a publish storage
     * @param {object} QoS quality of service received from published headers
     * @param {boolean} retain true, if the message should be retained for future subscribers
     * @param {boolean} dup true, if the message is a duplicate (currently unused)
     */
    publishMessage(message, QoS, retain, dup) {
        for (var clientId in this.clients) {
            if (retain) {
                if (message.value === undefined || message.value === "") {
                    delete this.retainMessages[message.topic];
                } else {
                    this.retainMessages[message.topic] = { message, QoS }
                }
            }
            var client = this.clients[clientId];
            client.publishMessage(message, QoS);
        }

    }

    /**
     * Deletes a message from the message list
     * @param {object} messageList message list of current client
     * @param {string} topic message topic
     * @param {string} id id of the message to delete
     */
    deleteMessageFromList(messageList, topic, id) {
        let message = messageList[topic];
        let isMessageDefined = message !== undefined;
        if (isMessageDefined && message.id == id && message.QoS <= 1) {
            delete messageList[topic];
        }
    }

    /**
     * @param {string} host host to send message to
     * @param {string} port port to send message to
     * @param {object} messageQueueEntry message to send
     * @param {function} callback function to call
     */
    sendMessage(client, messageQueueEntry, callback) {
        let host = client.host;
        let port = client.port;
        let message = messageQueueEntry.getPayload();
        let topic = message.topic;
        let id = messageQueueEntry.getId();
        let QoS = messageQueueEntry.getQoS();

        if (this.logPattern.getFirstMatch(topic)) {
            console.log("%s %s:%s/%s, QoS %s, Value %s", new Date().toLocaleString(), host, port, topic, QoS, message.value);
        }
        callback(host, port, message, QoS, id, (returnedId) => {
            if (id === returnedId) {
                if (QoS === 1) {
                    client.deleteMessageById(topic, id);
                } else if (QoS === 2) {
                    client.deleteMessageById(topic, id);
                }
            }
        });
    }

    /**
     * Sends all messages to a client
     * @param {Client} client client structure
     * @param {function} callback callback sending messages
     */
    sendClientMessages(client, callback) {
        client.processQoS0Messages(messageQueueEntry => {
            this.sendMessage(client, messageQueueEntry, callback);
        })
        for (let topic in client.orderedTopicsQueue) {
            client.processOrderedTopicMessages(topic, this.configuration.inFlightWindow, this.configuration.timeoutInMilliseconds,
                messageQueueEntry => {
                    this.sendMessage(client, messageQueueEntry, callback);
            })
        }
    }

    /**
     * Processes all messages needed to send
     * @param {function} callback(host, port, message, QoS, id, successCallback) 
     * function to be called for each message. The function has the parameter QoS and message
     */
    sendAllMessages(callback) {
        for (var clientId in this.clients) {
            var client = this.clients[clientId];
            if (client.getMaxRetryCount() >= this.configuration.maxRetryCount) {
                client.disconnect(clientId);
            }
            if (client.isConnected()) {
                this.sendClientMessages(client, callback);
            }
        };
    }

}

