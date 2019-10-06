/**
 * ---------------------------------------------------------------------------------------------------
 * This software is licensed under the GNU LESSER GENERAL PUBLIC LICENSE Version 3. It is furnished
 * "as is", without any support, and with no warranty, express or implied, as to its usefulness for
 * any purpose.
 * 
 * Provides a simple functionality to add a callback on break (^C) events. 
 * const shutdown = require("shutdown"); shutdown(() => {})
 * 
 * File:      shutdown.js
 *
 * Author:      Volker Böhm
 * Copyright:   Volker Böhm
 * Version:     1.0
 * ---------------------------------------------------------------------------------------------------
 */

'use strict';

const FORCE_SHUTDOWN_TIMEOUT_IN_MILLISECONDS = 4000;

var sigintCallback;
var timeout;

/**w
 * @param {function} callback function called on sigint before shutdown
 * @param {number} forceShutdownTimeoutInMilliseconds
 */
module.exports = (callback, forceShutdownTimeoutInMilliseconds) => {
    timeout = forceShutdownTimeoutInMilliseconds;
    if (isNaN(timeout)) {
        timeout = FORCE_SHUTDOWN_TIMEOUT_IN_MILLISECONDS;
    }
    sigintCallback = callback;

    process.on('SIGINT', () => {

        if (sigintCallback !== undefined) {
            sigintCallback();
        }
        
        setTimeout((err) => {
            if (err) {
                console.error(err);
            }
            process.exit(1);
        }, timeout);
    });
      
    process.on('SIGTERM', () => {
        process.exit(0);
    });

 }

