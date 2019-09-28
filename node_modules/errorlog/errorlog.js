/**
 * ---------------------------------------------------------------------------------------------------
 * This software is licensed under the GNU LESSER GENERAL PUBLIC LICENSE Version 3. It is furnished
 * "as is", without any support, and with no warranty, express or implied, as to its usefulness for
 * any purpose.
 *
 * File:      errorLog.js
 *
 * Author:      Volker Böhm
 * Copyright:   Volker Böhm
 * Version:     1.0
 * ---------------------------------------------------------------------------------------------------
 */

'use strict'

/**
 * logs an error
 * @param {object|string} error error object or error string
 */
module.exports = (error) => {
    if (typeof error === "string") {
        console.error("%s %s", new Date().toLocaleString(), error);
    } else if (typeof error === "object") {
        if (error.message !== undefined) {
            console.error("%s %s", new Date().toLocaleString(), error.message);
        }
        if (error.stack !== undefined) {
            console.error(error.stack);
        }
    }
};