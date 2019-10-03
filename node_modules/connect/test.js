/**
 * ---------------------------------------------------------------------------------------------------
 * This software is licensed under the GNU LESSER GENERAL PUBLIC LICENSE Version 3. It is furnished
 * "as is", without any support, and with no warranty, express or implied, as to its usefulness for
 * any purpose.
 *
 * File:        test.js
 * Purpouse:    test file for httpclient
 *
 * Author:      Volker Böhm
 * Copyright:   Volker Böhm
 * Version:     1.0
 * ---------------------------------------------------------------------------------------------------
 */

 'use strict'

 const Connect = require("@mangar2/connect");


class UnitTest {
    constructor(verbose) {
        this.success = 0;
        this.fail = 0;
        this.testNo = 0;
        this.verbose = verbose;
    }

    showResult(expectedAmount) {
        if (expectedAmount !== undefined && expectedAmount !== this.success ) {
            console.error("We expected " + expectedAmount + " success messages but have " + this.success);
        }
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

    assertEqual(a, b, text) {
        this.testNo++;
        if (a == b) {
            this.success++;
            if (this.verbose) { console.log("success: " + text); }
        } else {
            this.fail++;
            console.error("failed: " + a + " != "  + b + " " + text);
        }
    }

    delay(milliseconds) {
        return new Promise(resolve => setTimeout(resolve, milliseconds));
    }
    
}
var unitTest = new UnitTest(true);



(async function test() {    
    let result;
    const CLEAN = true;
    // Test connect
    let connect = new Connect("/connect/test", "127.0.0.1", 9001, 9002);
    result = await connect.connect(CLEAN).catch(reason => console.log(reason));
    unitTest.assertTrue(connect.isConnected, "successful connected");
    unitTest.assertEqual(result.present, 0, "No connection present");
    // Test disconnect
    await connect.disconnect().catch(reason => console.log(reason));
    unitTest.assertTrue(!connect.isConnected, "disconnected");
    // Test having an old connection (clean = false)
    await connect.connect(!CLEAN).catch(reason => console.log(reason));
    await connect.disconnect().catch(reason => console.log(reason));
    result = await connect.connect(!CLEAN).catch(reason => console.log(reason));
    unitTest.assertEqual(result.present, 1, "Connection is present");
    // Test subscribe
    result = await connect.subscribe({"/a/a": 0, "/a/1": 1, "/a/2": 2, "b/b": 1});
    unitTest.assertEqual(result, '{"QoS":[0,1,2,1]}', "subscribe with the right QoS" );
    // Test unsubscribe
    result = await connect.unsubscribe(["/a/a", "/a/1", "/a/2", "b/b"]);
})();

