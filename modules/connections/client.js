/**
 * ---------------------------------------------------------------------------------------------------
 * This software is licensed under the GNU LESSER GENERAL PUBLIC LICENSE Version 3. It is furnished
 * "as is", without any support, and with no warranty, express or implied, as to its usefulness for
 * any purpose.
 *
 * File:        client.js
 * Purpouse:    Hold one connection to a service/sensor
 *
 * Author:      Volker Böhm
 * Copyright:   Volker Böhm
 * Version:     1.0
 * ---------------------------------------------------------------------------------------------------
 */

'use strict';

const TopicMatch = require("@mangar2/topicmatch");
const MessageQueueEntry = require("./messageQueueEntry");

 module.exports = class Client {

    /**
     * Creates a new connection
     * @param {object} param {clientId, host, port} body of the http message
     */
    constructor(param) {
        for (let attrib in param) {
            this[attrib] = param[attrib];
        }
        if (this.subscribePattern !== undefined && this.subscribePattern.constructor.name !== "TopicMatch") {
            this.subscribePattern = new TopicMatch(this.subscribePattern);
        }
        this.rebuildMessageQueues();
        this.nextMessageId = 0;
    }

    rebuildMessageQueues() {
        if (this.QoS0Queue !== undefined) {
            for(let index in this.QoS0Queue) {
                let entry = this.QoS0Queue[index];
                this.QoS0Queue[index] = new MessageQueueEntry(entry.QoS, entry.payload);
            }
        }
        for (let topic in this.orderedTopicsQueue) {
            let queue = this.orderedTopicsQueue[topic];
            for (let index in queue) {
                let entry = queue[index];
                queue[index] = new MessageQueueEntry(entry.QoS, entry.payload);
            }
        }
    }

    /**
     * @returns {boolean} true, if the client is connected
     */
    isConnected() {
        return this.status === "connected";
    }

    /**
     * Gets the message queue
     * @returns {Array} array of queued elements
     */
    getMessageQueue() {
        return this.messageQueue;
    }

    /**
     * Cleans up the session
     */
    cleanSession() {
        this.orderedTopicsQueue = {};
        this.subscribePattern = new TopicMatch();
        this.status = "clean"; 
    }

    /** 
     * Initializes values if not already set
     */
    init() {
        this.QoS0Queue = [];
        if (this.subscribePattern === undefined) {
            this.subscribePattern = new TopicMatch();
        }
        if (this.orderedTopicsQueue === undefined) {
            this.orderedTopicsQueue = {}
        }

    }

    /**
     * sets the connection to "connected", resets the unsuccessful counter to 0, starts with 
     * messageId 0 and stores the current timestamp.
     * @param {any} clientId id of the client
     * @param {string} host host name
     * @param {string} port port name
     * @param {bool} clean true, if the connection will be cleaned on disconnect
     */
    connect(clientId, host, port, clean) {
        this.status = "connected";
        this.sendWithoughSuccess = 0;    
        this.startToTransmitTimestamp = 0;
        
        if (this.clientId === undefined && clientId !== undefined)  {
            this.clientId = clientId;
        }

        if (this.clientId !== clientId) {
            throw Error("clientId does not match (" + clientId + ")");
        }
        
        if (host !== undefined) {
            this.host = host;
        }
        if (port !== undefined) {
            this.port = port;
        }
        if (clean !== undefined) {
            this.clean = (clean === true || clean === "true");
        } else if (this.clean === undefined) {
            this.clean = true;
        }

        if (this.clean) {
            this.cleanSession();
        }

        this.init();
        this.clearRetryCount();
        this.validate();
        this.connectTimestamp = new Date().getTime();
    }

    /**
     * Disconnects a client
     * @param {any} clientId id of the client
     * @throws {Error} if clientId does not match
     */
    disconnect(clientId) {

        if (this.clientId !== clientId) {
            throw Error("clientId does not match (" + clientId + ")");
        }
        
        this.status = "disconnected";          
        this.QoS0Queue = [];
        if (this.clean) {
            this.cleanSession();
        }
       
    }

    /**
     * Validates a subscribe/unsubscribe parameter
     * @param {any} clientId id of the client
     * @throws {Error} if clientId does not match or subscription is not given
     */
    validateSubscribe(clientId, topics) {
        if (this.clientId !== clientId) {
            throw Error("clientId does not match (" + clientId + ")");
        }
        if (topics === undefined || topics.constructor !== Object || Object.entries(topics).length === 0) {
            throw Error("Subsribe without topics");
        }
        if (this.status !== "connected") {
            throw Error("Subscribe without beeing connected")
        }
    }

    /**
     * Adds a subscription to the connection
     * @param {object} subscribe {QoS:Qos, topics:[topic1, topic2, ...]}
     * @throws {Error} if clientId does not match or subscription is not given
     */
    subscribeOldFormat(subscribe) {
        let QoS = this.convertQoSToValidQoS(subscribe.QoS);
        let topics = subscribe.topics;
        let result = [];

        if (!Array.isArray(topics)) {
            this.subscribePattern.setPattern(topics, QoS);
            result.push(QoS);
        } else {
            for (let topic of topics) {
                this.subscribePattern.setPattern(topic, QoS);
                result.push(QoS);
            };
        }
        return result;
    }

    /**
     * Adds a subscription to the connection
     * @param {any} clientId id of the client
     * @param {object} topics {topic1:QoS1, topic2:Qos2, ...}
     * @throws {Error} if clientId does not match or subscription is not given
     */
    subscribe(clientId, topics) {
        let result = [];
        try {
            this.validateSubscribe(clientId, topics);
            if (topics.topics === undefined) {
                for(let topic in topics) {
                    let QoS = this.convertQoSToValidQoS(topics[topic]);
                    result.push(QoS);
                    this.subscribePattern.setPattern(topic, QoS);
                }
            } else {
                result = this.subscribeOldFormat(topics);
            }
        } catch (err) {
            result = [0x80];
            console.error(err.message);
        }
        return result;
    }

    /**
     * checks if topics is either a string or an array with at least one element
     * @param {string|array} topics 
     */
    static isStringOrFilledArray(topics) {
        let result = false;
        if (topics !== undefined) {
            if (Array.isArray(topics) && topics.length > 0) {
                result = true;
            } else if (typeof(topics) === 'string') {
                result = true;
            }
        }
        return result;
    }

    /**
     * removes subscriptions from topics
     * @param {any} clientId id of the client
     * @param {string|array} topics array of topic strings with wildchars
     * @throws {Error} if clientId does not match or subscription is not given
     */
    unsubscribe(clientId, topics) {
        if (this.clientId !== clientId) {
            throw Error("clientId does not match (" + clientId + ")");
        }
        if (!Client.isStringOrFilledArray(topics)) {
            throw Error("Unsubscribe without topics");
        }
        if (this.status !== "connected") {
            throw Error("Unsubscribe without beeing connected")
        }
        this.subscribePattern.removePattern(topics);
    }

    /**
     * Adds a message to an ordered topic
     * @param {object} messageQueueEntry entry of the message queue
     */
    addMessageToOrderedTopic(messageQueueEntry) {
        const MAX_QUEUED_MESSAGES_PER_TOPIC = 100;
        let message = messageQueueEntry.payload;
        let topic = message.topic;

        if (!Array.isArray(this.orderedTopicsQueue[topic])) {
            this.orderedTopicsQueue[topic] = [];
        }
        this.orderedTopicsQueue[topic].push(messageQueueEntry);
        if (this.orderedTopicsQueue[topic].length > MAX_QUEUED_MESSAGES_PER_TOPIC) {
            this.orderedTopicsQueue[topic].slice(0, 1);
        }
    }

    /**
     * checks, if a message must be published 
     * @param {object} message message to add to a publish storage
     * @param {object} QoS quality of service received from published headers
     * @param {boolean} dup true (or 1), if the message is a duplicated 
     * @param {TopicMatch} pattern optional: alternative match filter to filter messages
     * (only relevant in QoS=2 that is not yet implemented)
     */
    publishMessage(message, QoS, dup, pattern) {
        let topic = message.topic;
        let matchQoS;
        
        if (pattern !== undefined && pattern.constructor.name === 'TopicMatch') {
            matchQoS = pattern.getBestMatch(topic);
        } else {
            matchQoS = this.subscribePattern.getBestMatch(topic);
        }  

        if (matchQoS !== undefined) {
            QoS = this.calcQoS(QoS, matchQoS);
            let messageQueueEntry = new MessageQueueEntry(QoS, message);
            if (QoS === 0) {
                this.QoS0Queue.push(messageQueueEntry);
            } else {
                messageQueueEntry.setId(this.genMessageId());
                this.addMessageToOrderedTopic(messageQueueEntry);
            }
    
        }
    }

    /**
     * Deletes a message from the message queue if the id matches
     * @param {string} topic topic to delete message from
     * @param {Number} id id of the message
     */
    deleteMessageById(topic, id) {
        let messageQueue = this.orderedTopicsQueue[topic];
        if (Array.isArray(messageQueue)) {
            for (let index in messageQueue) {
                let messageQueueEntry = messageQueue[index];
                if (messageQueueEntry.id === id) {
                    messageQueue.splice(index, 1);
                    break;
                }
            }
        }
    }

    /**
     * calculates the next message id
     * @returns {number} message id
     */
    genMessageId() {
        var result = this.nextMessageId;
        if (result >= 0 || result < 0xFFFF) {
            this.nextMessageId++;
        } else {
            result = 0;
            this.nextMessageId = 1;
        }
        return result;
    }

    /**
     * Converts a QoS to a valid QoS. (0,1,2) by converting it to Number and setting it to "0" on any invalid entry
     * @param {any} Qos QoS to transform
     * @return {Number} valid QoS
     */
    convertQoSToValidQoS(QoS) {
        var numberQoS = Number(QoS);
        if (numberQoS != 1 && numberQoS != 2) {
            numberQoS = 0;
        }
        return numberQoS;
    }

    /**
     * Calculates the resulting QoS from message an subscription
     * @param {Number} messageQoS QoS from message
     * @param {Number} subscribeQoS QoS from subscription
     */
    calcQoS(messageQoS, subscribeQoS) {
        var validMessageQoS = this.convertQoSToValidQoS(messageQoS);
        var validSubscribeQoS = this.convertQoSToValidQoS(subscribeQoS);
        var result = Math.min(validMessageQoS, validSubscribeQoS);
        return result;
    }

    /**
     * process entries for an ordered topic 
     * @param {string} topic topic of the messages
     * @param {number} inFlightWindow maximal amount of messages to process
     * @param {number} timeoutInMilliseconds timeout waiting for messages
     * @param {function} callback(entry) called for each entry
     */
    processOrderedTopicMessages(topic, inFlightWindow, timeoutInMilliseconds, callback) {
        let queue = [...this.orderedTopicsQueue[topic]];
        let count = 0;
        let now = (new Date()).getTime();
        for (let entry of queue) {
            if (entry.status === "new") {
                entry.status = "sending";
            } else if (entry.transmitTimestamp + timeoutInMilliseconds < now) {
                entry.status = "duplicate";
            } else {
                break;
            }
            entry.startTransmission();
            callback(entry);
            count++;
            if (count === inFlightWindow) break;            
        }
    }

    /**
     * Gets the maximal retry count for a client
     */
    getMaxRetryCount() {
        let result = 0;
        for (let topic in this.orderedTopicsQueue) {
            let queue = this.orderedTopicsQueue[topic];
            // We only check the first entry, as all following entries may not have a higher 
            // retry count 
            if (queue.length > 0) {
                let entry = queue[0];
                if (entry.retryCount > result) {
                    result = entry.retryCount;
                }
            }
        }
        return result;
    }

     /**
     * clears all retry counts
     */
    clearRetryCount() {
        for (let topic in this.orderedTopicsQueue) {
            let queue = this.orderedTopicsQueue[topic];
            for (let entry of queue) {
                entry.retryCount = 0;
            }
        }
    }

    /**
     * processes all entries of the QoS0Message queue and deletes the queue
     * @param {function} callback(entry)
     */
    processQoS0Messages(callback) {
        let QoS0Queue = [...this.QoS0Queue];
        this.QoS0Queue = [];
        for (let entry of QoS0Queue) {
            entry.status = "sending";
            callback(entry);
        }
    }

    /**
     * Validates the object, throws errors, on failure
     */
    validate() {
        if (this.clientId === undefined) {
            throw Error("Connection without client id (clientId)");
        }
        if (this.host === undefined) {
            throw Error("Connection without host");
        }
        if (this.port === undefined) {
            throw Error("Connection without port");
        }
        if (this.clean !== true && this.clean !== false) {
            throw Error("Illegal clean value " + this.clean)
        } 
    }

 };