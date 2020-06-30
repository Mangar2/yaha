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
        port: { type: 'number', minimum: 1025, maximum: 65536 },
        persistInterval: { type: 'number', minimum: 0, maximum: 365 * 24 * 3600 * 1000 },
        connections: {
            type: 'object',
            properties: {
                fileName: { type: 'string' },
                directory: { type: 'string' },
                log: { $ref: '#log' }
            },
            required: ['fileName', 'directory'],
            additionalProperties: false
        }
    },
    required: ['port', 'persistInterval', 'connections'],
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
    connections: {
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
