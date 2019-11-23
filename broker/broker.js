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
 * ---------------------------------------------------------------------------------------------------
 */

'use strict'

const Broker = require('@mangar2/broker')
const MessageStore = require('@mangar2/messagestore')
const config = require('./config.json')
const options = require('@mangar2/config')(config)

const broker = new Broker(options.broker)
if (options.messagestore !== undefined) {
    const messageStore = new MessageStore(options.messagestore)
    messageStore.run()
    broker.on('publish', message => {
        messageStore.addMessage(message)
    })
}
broker.run()
broker.connect('192.168.0.4', 8183)
