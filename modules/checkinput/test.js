/**
 * ---------------------------------------------------------------------------------------------------
 * This software is licensed under the GNU LESSER GENERAL PUBLIC LICENSE Version 3. It is furnished
 * "as is", without any support, and with no warranty, express or implied, as to its usefulness for
 * any purpose.
 *
 * File:      test.js
 *
 * Author:      Volker Böhm
 * Copyright:   Volker Böhm
 * ---------------------------------------------------------------------------------------------------
 */

'use scrict'


const CheckInput = require("./checkInput");
let check;


class UnitTest {
    
    /**
     * Creates an object to support unit tests
     * @param {boolean} verbose true to give more output
     */
    constructor(verbose) {
        this.successAmount = 0;
        this.failAmount = 0;
        this.verbose = verbose === undefined ? false : verbose;
    }

    /**
     * Show the overall test result. Exits the process with "1" on failure
     * @param {number} expectedAmount expected amount of positive test in the current run
     */
    showResult(expectedAmount) {
        console.log("success: %s, failed: %s", this.successAmount, this.failAmount);
        if (expectedAmount !== undefined && expectedAmount !== this.successAmount) {
            console.error("Failed! We expected " + expectedAmount + " success messages but have " + this.successAmount);
            process.exit(1);
        } else if (this.failAmount !== 0) {
            console.error("Failed!");
            process.exit(1);
        } else {
            console.log("passed!");
        }
    }

    /**
     * Adds a failure 
     * @param {string} message message to print on failure
     */
    fail(message) {
        this.failAmount++;
        console.error("failed: " + message);
    }

    /**
     * Adds a success
     * @param {string} message message to print on success (if verbose is true)
     */
    success(message) {
        this.successAmount++;
        if (this.verbose) {
            console.log("success: " + message);
        }
    }

    /**
     * Tests a value for beeing true, fails if the value is false
     * @param {boolean} test test value
     * @param {string} message info message on success/fail
     */
    assertTrue(test, message) {
        if (test) {
            this.success(message);
        } else {
            this.fail(test + " is not true " + message);
        }
    }

    /**
     * Tests a value for beeing false, fails if the value is true
     * @param {boolean} test test value
     * @param {string} message info message on success/fail
     */
    assertFalse(test, message) {
        if (!test) {
            this.success(message);
        } else {
            this.fail(test + " is not false " + message);
        }
    }

    /**
     * Compares two values, fails if they are not equal "=="
     * @param {any} a first value
     * @param {any} b second value
     * @param {string} message info message on success/fail
     */
    assertEqual(a, b, message) {
        if (a == b) {
            this.success(message);
        } else {
            this.fail(a + " != "  + b + " " + message);
        }
    }

    /**
     * Pauses the execution for a while (needs to "wait") for the result.
     * @param {number} timeInMilliseconds delay in milliseconds
     */
    delay(timeInMilliseconds) {
        return new Promise(resolve => setTimeout(resolve, timeInMilliseconds));
    }
    
}

let unitTest = new UnitTest();

// Number
check = new CheckInput({type: "number", minimum: 0, maximum : 50});
unitTest.assertTrue(check.check(0));
unitTest.assertTrue(check.check(5));
unitTest.assertTrue(check.check(0x10));
unitTest.assertTrue(check.check(50));
unitTest.assertFalse(check.check(-1));
console.log(check.messages);
unitTest.assertFalse(check.check(51));
console.log(check.messages);
unitTest.assertFalse(check.check(50.001));
console.log(check.messages);
unitTest.assertFalse(check.check(1234567890));
console.log(check.messages);
unitTest.assertFalse(check.check("hello"));
console.log(check.messages);
unitTest.assertFalse(check.check("5"));

// String 
check = new CheckInput({type: "string", minLength: 0, maxLength:10})
unitTest.assertTrue(check.check(""));
unitTest.assertTrue(check.check(''));
unitTest.assertTrue(check.check('hello'));
unitTest.assertTrue(check.check('1234567890'));
unitTest.assertFalse(check.check("12345678901"));
console.log(check.messages);

// Date
check = new CheckInput({type: "string", format: "date-time"})
unitTest.assertTrue(check.check('2019-10-06T07:52:11.881Z'), " check date format");
unitTest.assertFalse(check.check('2019-10-06'), " check date format");
console.log(check.messages);
unitTest.assertFalse(check.check('.881'), " check date format");
console.log(check.messages);
unitTest.assertFalse(check.check('Z'), " check date format");
console.log(check.messages);

// Object
check = new CheckInput({
    type: 'object',
    properties: {
        topic: {type: 'string'},
        value: {type: 'string'},
        reason: {
            type: 'array',
            items: {
                type: 'object',
                properties: {
                    message: {type: 'string'},
                    timestamp: {type: 'string', format: 'date-time'}
                },
                required: ['message']
            }
        }
    },
    required: ['topic', 'value']
});

unitTest.assertTrue(check.check({topic: "/a/b", value: "on", reason: [{message: "hello", timestamp: "2019-10-05T07:52:11Z"}]}));