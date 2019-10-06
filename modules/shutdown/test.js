/**
 * ---------------------------------------------------------------------------------------------------
 * This software is licensed under the GNU LESSER GENERAL PUBLIC LICENSE Version 3. It is furnished
 * "as is", without any support, and with no warranty, express or implied, as to its usefulness for
 * any purpose.
 *
 * File:        test.js
 * Purpouse:    test file for shutdown
 *
 * Author:      Volker Böhm
 * Copyright:   Volker Böhm
 * Version:     1.0
 * ---------------------------------------------------------------------------------------------------
 */

const shutdown = require('./shutdown');

shutdown(async () => {
    console.log("SIGINT received");
    await delay(1000);
    console.log("safe shutdown")
    process.exit(0);
});


function delay(milliseconds) {
    return new Promise(resolve => setTimeout(resolve, milliseconds));
}

(async () => {
    for (i = 0; i < 10; i++) {
        await delay(1000);
        console.log(".");
    }
})()



