/**
 * @license
 * This software is licensed under the GNU LESSER GENERAL PUBLIC LICENSE Version 3. It is furnished
 * "as is", without any support, and with no warranty, express or implied, as to its usefulness for
 * any purpose.
 *
 * @author Volker Böhm
 * @copyright Copyright (c) 2020 Volker Böhm
 */

'use strict'

const { types, errorLog } = require('@mangar2/utils')
const readConfiguration = require('@mangar2/config').readConfiguration
const sanitize = require('@mangar2/configuration')
const CheckInput = require('@mangar2/checkinput')

const checkConfiguration = new CheckInput({
    type: 'object',
    properties: {
        port: {
            description: 'number of the port the broker listens to',
            type: 'number',
            minimum: 1,
            maximum: 65536
        },
        persistInterval: {
            description: 'amount of millisecons between persisting the state to a file',
            type: 'number',
            minimum: 0,
            maximum: 365 * 24 * 3600 * 1000
        },
        cors: {
            description: 'cors settings',
            type: 'object',
            properties: {
                allowOrigin: {
                    description: 'Access-Control-Allow-Origin settings for put, get and options' ,
                    tpye: 'string'
                }
            },
            required: ['allowOrigin'],
            additionalProperties: false
        },
        connections: {
            description: 'connection configuration',
            type: 'object',
            properties: {
                inFlightWindow: {
                    description: 'amount of parallel calls per topic.',
                    type: 'number',
                    minimum: 1,
                    maximum: 100

                },
                timeoutInMilliseconds: {
                    description: 'timeout in Milliseconds to wait for an answer of a http publish',
                    type: 'number',
                    minimum: 0,
                    maximum: 3600 * 1000
                },
                maxRetryCount: {
                    description: 'amount of retries to publish to a client before disconnecting it',
                    type: 'number',
                    minimum: 1,
                    maximum: 1000
                },
                maxQueueSize: {
                    description: 'amount of QoS=1 or QoS=2 messages in a queue for the same topic',
                    type: 'number',
                    minimum: 1,
                    maximum: 10000
                },
                fileName: {
                    description: 'name of the file to store the broker state (adding a timestamp to the filename)',
                    type: 'string'
                },
                directory: {
                    description: 'directory to store the broker state',
                    type: 'string'
                },
                log: { $ref: '#log' }
            },
            required: ['inFlightWindow', 'timeoutInMilliseconds',
                'maxRetryCount', 'maxQueueSize',
                'fileName', 'directory'],
            additionalProperties: false
        }
    },
    required: ['port', 'cors', 'persistInterval', 'connections'],
    additionalProperties: false,
    definitions: {
        log: {
            $id: '#log',
            type: 'array',
            items: {
                type: 'object',
                properties: {
                    module: { enum: ['all', 'send', 'receive'] },
                    topic: { type: '#' },
                    level: { type: 'integer' }
                },
                required: ['module', 'topic'],
                additionalProperties: false
            }
        }
    }
})

/**
 * @private
 * @description
 * Configuration default values
 */
const defaultConfiguration = {
    port: 9001,
    persistInterval: 60 * 1000,
    cors: {
        allowOrigin: '*'
    },
    connections: {
        inFlightWindow: 1,
        timeoutInMilliseconds: 10000,
        maxRetryCount: 10,
        maxQueueSize: 1000,
        fileName: 'broker',
        directory: '.',
        log: [{
            module: 'all',
            topic: '$SYS/#'
        }]
    }
}

/**
 * @private
 * Gets the configuration, fills default values and sanitizes it
 * @param {string} filename name of the configuration file
 * @returns {Object} configuration
 */
function getConfiguration (filename) {
    // path to your configuration file
    const config = readConfiguration(filename)
    if (!types.isObject(config.broker)) {
        errorLog('The active configuration does not contain a "broker" section, program stopped')
        process.exit(1)
    }
    config.broker = sanitize(config.broker, defaultConfiguration, checkConfiguration)
    return config
}

module.exports = getConfiguration
