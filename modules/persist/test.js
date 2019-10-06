/**
 * ---------------------------------------------------------------------------------------------------
 * This software is licensed under the GNU LESSER GENERAL PUBLIC LICENSE Version 3. It is furnished
 * "as is", without any support, and with no warranty, express or implied, as to its usefulness for
 * any purpose.
 *
 * File:        test.js
 * Purpouse:    test file for persist
 *
 * Author:      Volker Böhm
 * Copyright:   Volker Böhm
 * Version:     1.0
 * ---------------------------------------------------------------------------------------------------
 */

 const Persist = require("./Persist.js");
 var persist = new Persist({"keepFiles": 3});

class UnitTest {
    constructor(verbose) {
        this.success = 0;
        this.fail = 0;
        this.verbose = verbose;
    }

    showResult() {
        console.log("success: %s, failed: %s", this.success, this.fail);
    }

    assertEqual(a, b, text) {
        this.testNo++;
        if (a == b) {
            this.success++;
            if (this.verbose || this.verbose === undefined) { console.log("success: " + text); }
        } else {
            this.fail++;
            console.error("failed: " + a + " != "  + b + " " + text);
        }
    }

    assertDeepEqual(a, b, text) {
        this.assertEqual(JSON.stringify(a), JSON.stringify(b), text);
    }

}

var unitTest = new UnitTest();

async function cleanFiles() {
    await Persist.deleteOldFiles(".", "test", 0);
}

(async () => {
    let readJSON = persist.readData(".", "test");
    unitTest.assertEqual(readJSON, undefined, "read not existing file");

    test1JSON = {"hello1": "world1"};
    test2JSON = {"hello2": "world2"};
    await cleanFiles();
    await persist.saveObjectToFile(".", "test", test1JSON);
    readJSON = persist.readData(".", "test");
    unitTest.assertDeepEqual(test1JSON, readJSON, "simple read");
    
    await cleanFiles();
    await persist.saveObjectToFile(".", "test", test1JSON);
    await persist.saveObjectToFile(".", "test", test2JSON);
    readJSON = persist.readData(".", "test");
    unitTest.assertDeepEqual(test2JSON, readJSON, "newest file");

    unitTest.showResult();
    await cleanFiles();
    
})();