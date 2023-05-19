# Using Chat GPT for coding

ChatGPT is a very good tool to support you for coding. It will not do your job - but help you especially for the boring tasks. It is on one hand supprisingly intelligent but sometimes also suprisingly stupid and still very convincing. Always check, what he is doing. 

The following script describes a way how to use ChatGPT. He remembers many things and you can influence it well how and how good he helps you. I use a simple class here to demonstrate how ChatGPT can be used.

ChatGPT - even in the Plus version - has a limit of 2048 characters for generation. You have to ask him to generate specific things and not extended classes or programs. 

I use the ChatGPT Plus version (20$ per month) in the version 3.5, bringen fastest results.

## The example code

I use an old class of mine that "grew" when used and was never "designed" and never cleaned. I use the chance now to refactor it with the help of ChatGPT. It is easy to understand and has no dependencies making it a good example. It is a helper class for unit tests.
There are good unit test frameworks awailable - like Jest. So there is no business-reason to build an own unit test class. Here is the code:

```JavaScript
/**
 * @license
 * This software is licensed under the GNU LESSER GENERAL PUBLIC LICENSE Version 3. It is furnished
 * "as is", without any support, and with no warranty, express or implied, as to its usefulness for
 * any purpose.
 *
 * @author Volker Böhm
 * @copyright Copyright (c) 2020 Volker Böhm
 * @overview This module provides a simple class to support unit tests, this is not a framework.
 * Use "testrun", as a simple uinit test framework
 */

'use strict'

const assert = require('assert')
const  { errorlog } = require('@mangar2/utils')

/**
 * Creates an object supporting unit tests
 * @param {boolean} verbose true to give more output
 * @param {bool} debug true, to print a stack trace on fail
 * @example
 * const unitTest = new UnitTest(true, true)
 * unitTest.assertEqual('1', '1', 'equal')
 * unitTest.assertTrue(true, 'true')
 * unitTest.assertFalse(false, 'false')
 * unitTest.success('success')
 * unitTest.log('just a log')
 * unitTest.assertDeepEqual({ a: 'b' }, { a: 'b' })
 * unitTest.expectException(() => { throw new Error('Hello World') }, 'Error', 'message')
 */
class UnitTest {
    constructor(verbose = false, debug = false) {
        this._successAmount = 0
        this._failAmount = 0
        this._verbose = verbose
        this._debug = debug
    }

    /**
     * Set verbose to true to print all success infos
     * @type {bool}
     */
    set verbose(verbose) { this._verbose = verbose }
    get verbose() { return this._verbose }

    /**
     * Set debug to true, to print a stack trace on fail
     * @type {bool}
     */
    set debug(debug) { this._debug = debug }
    get debug() { return this._debug }

    /**
     * Show the overall test result. Exits the process with "1" on failure
     * @param {number} expectedAmount expected amount of positive test in the current run
     */
    showResult(expectedAmount) {
        console.log('success: %s, failed: %s', this._successAmount, this._failAmount)
        if (expectedAmount !== undefined && expectedAmount !== this._successAmount) {
            console.error('Failed! We expected ' + expectedAmount + ' success messages but have ' + this._successAmount)
            process.exit(1)
        } else if (this._failAmount !== 0) {
            console.error('Failed!')
            process.exit(1)
        } else {
            console.log('passed!')
        }
    }

    /**
     * Adds a failure
     * @param {string} message message to print on failure
     */
    fail(message) {
        this._failAmount++
        if (message === undefined || message === null) {
            message = ''
        }
        console.error('failed: ' + message)
        if (this._debug) {
            console.log(new Error().stack)
        }
    }

    /**
     * Adds a success
     * @param {string} message message to print on success (if verbose is true)
     */
    success(message) {
        this._successAmount++
        if (message === undefined || message === null) {
            message = ''
        }
        if (this._verbose) {
            console.log('success: ' + message)
        }
    }

    /**
     * Tests a value for beeing true, fails if the value is false
     * @param {boolean} test test value
     * @param {string} message info message on success/fail
     * @returns {boolean} true/false based on success
     */
    assertTrue(test, message) {
        if (message === undefined || message === null) {
            message = ''
        }
        if (test) {
            this.success(message)
        } else {
            this.fail(test + ' is not true ' + message)
        }
        return test
    }

    /**
     * Tests a value for beeing false, fails if the value is true
     * @param {boolean} test test value
     * @param {string} message info message on success/fail
     * @returns {boolean} true/false based on success
     */
    assertFalse(test, message) {
        if (message === undefined || message === null) {
            message = ''
        }
        const result = !test
        if (result) {
            this.success(message)
        } else {
            this.fail(test + ' is not false ' + message)
        }
        return result
    }

    /**
     * Compares two values, fails if they are not equal "=="
     * @param {any} a first value
     * @param {any} b second value
     * @param {string} message info message on success/fail
     * @returns {boolean} true/false based on success
     */
    assertEqual(a, b, message) {
        if (message === undefined || message === null) {
            message = ''
        }
        const result = (a === b)
        if (result) {
            this.success(message)
        } else {
            this.fail(a + ' != ' + b + ' ' + message)
        }
        return result
    }

    /**
     * Validates a result object against an expected object. It validates with
     * exact equal, that "result" has all object properties of expected.
     * @param {Object} result object to be validated
     * @param {Object} expected expected object
     * @param {string} path path to be displayed on success/error
     * @param {boolean} [exact=false] true, if result may not have additional properties
     * @returns {boolean} true, if the test is ok
     */
    validateResult(toValidate, expected, path, exact = false) {
        let result = true
        for (const property in expected) {
            if (toValidate[property] !== expected[property]) {
                result = false
                this.fail(path + '/' + property)
            }
        }
        if (exact) {
            for (const property in toValidate) {
                if (toValidate[property] !== expected[property]) {
                    result = false
                    this.fail(path + '/' + property)
                }
            }
        }
        if (result) {
            this.success(path)
        }
        return result
    }

    /**
     * Recursively replaces substrings
     * @param { object | array | string } toReplace 
     * @param {{ [index:string]: string }} strRepl replace string by string
     * @returns object with replaced values in strings
     */
    replaceRec(toReplace, strRepl) {
        if (toReplace === null || toReplace === undefined) {
            return toReplace
        } else if (Array.isArray(toReplace)) {
            for (const index in toReplace) {
                const elem = toReplace[index]
                toReplace[index] = this.replaceRec(elem, strRepl)
            }
        } else if (typeof (toReplace) === 'object') {
            for (const index in toReplace) {
                toReplace[index] = this.replaceRec(toReplace[index], strRepl)
            } 
        } else if (typeof (toReplace) === 'string') {
            for (const searchValue in strRepl) {
                const replaceValue = strRepl[searchValue]
                if (toReplace === searchValue) {
                    toReplace = replaceValue
                } else if (typeof(replaceValue) === 'string') {
                    toReplace = toReplace.replace(searchValue, replaceValue)
                }
            }
        }
        return toReplace
    }

    /**
     * @description
     * Checks an element recursively for differences. It only checks values that are specified in "expected"
     * and ignores additional data in result. This enables us to specify only the values that we like to check
     * in the test cases.
     * @param {any} toValidate element to be validated
     * @param {any} expected description of expected element
     * @param {string} path path to the element to compare
     * @param {string} [exact=false]
     * @throws {string} first difference
     */
    validateRec(toValidate, expected, path, exact = false) {
        if (toValidate === expected) {
            return
        }
        else if (toValidate === undefined) {
            throw path + ': undefined'
        } else if (typeof (toValidate) !== typeof (expected) || Array.isArray(toValidate) !== Array.isArray(expected)) {
            throw path + ': types are different '
        }
        else if (Array.isArray(expected)) {
            if (toValidate.length !== expected.length) {
                throw path + ': arrays have different length'
            }
            for (const index in toValidate) {
                this.validateRec(toValidate[index], expected[index], path + '/' + index)
            }
        } else if (typeof (expected) === 'object') {
            for (const index in expected) {
                this.validateRec(toValidate[index], expected[index], path + '/' + index)
            } 
            if (exact) {
                for (const index in toValidate) {
                    if (expected[index] === undefined) {
                        throw `${path}: additional property ${index}`
                    }
                }
            }
        } else {
            throw path + ': elements have different value: ' + toValidate + ' !== ' + expected
        }
    }

    /**
     * @private
     * @description
     * Checks an element "deeply" for differences
     * @param {any} a first element to compare
     * @param {any} b second element to compare
     * @param {string} path path to the element to compare
     * @throws {string} description of the difference including the path to the element
     */
    _deepEqualRec(a, b, path) {
        if (a === b) {
            return
        }
        if (typeof (a) !== typeof (b) || Array.isArray(a) !== Array.isArray(b)) {
            throw path + ': types are different '
        }
        if (Array.isArray(a)) {
            if (a.length !== b.length) {
                throw path + ': arrays have different length'
            }
            for (const index in a) {
                this._deepEqualRec(a[index], b[index], path + '/' + index)
            }
        } else if (typeof (a) === 'object') {
            if (Object.keys(a).length !== Object.keys(b).length) {
                throw path + ': objects have different amount of properties'
            }
            if (a.constructor.name !== b.constructor.name) {
                throw path + ': objects have different constructor names: ' + a.constructor.name + ' != ' + b.constructor.name
            }
            for (const index in a) {
                this._deepEqualRec(a[index], b[index], path + '/' + index)
            }
        } else {
            throw path + ': elements have different value: ' + a + ' !== ' + b
        }
        assert.deepStrictEqual(a, b, path)
    }

    /**
     * Compares two objects deeply
     * @param {any} a first object to compare
     * @param {any} b second object to compare
     * @param {string} message message to show
     * @returns {boolean} true/false based on success
     */
    assertDeepEqual(a, b, message) {
        let result = true
        if (message === undefined || message === null) {
            message = ''
        }
        try {
            this._deepEqualRec(a, b, '')
            assert.deepStrictEqual(a, b, message)
            this.success(message)
        } catch (err) {
            this.fail(message + ' ' + err)
            result = false
        }
        return result
    }

    /**
     * Runs a function and checks for a returned expection
     * @param {function} callback function causing the expection
     * @param {string} instance instance of the exception
     * @returns {boolean} true on expection
     */
    expectException(callback, instance, message) {
        try {
            callback()
        } catch (err) {
            const isInstance = instance === undefined || err.constructor.name === instance
            if (isInstance) {
                this.success(message)
            } else {
                this.fail('Wrong assertion ' + message)
            }
            return true
        }
        this.fail('No assertion ' + message)
        return false
    }

    /**
     * Logs a string, if verbose
     * @param {string} info info to log
     */
    log(info) {
        if (this._verbose) {
            console.log(info)
        }
    }

    /**
     * Logs an error usually from a catch section
     * @param {Error|string} err error information
     */
    logError(err) {
        if (this._verbose) {
            errorlog(err, this._debug)
        }
    }
}

module.exports = UnitTest

```

ChatGPT remembers what you told him in a chat - even after days. It stores it in your "chat". I will now print my questions to ChatGPT in normal text and the answers in italics. 

i have code for you:

*Sure, I'd be happy to help you with your code! Please feel free to share it with me and let me know how I can assist you.*

Code ...

*This looks like a JavaScript class definition for a unit testing framework. It provides a set of methods to perform tests on code and output the results.*
... (Full answer cut)

are there improvements for showResult ?

*One potential improvement for the showResult method would be to provide more detailed information about each test that failed, rather than simply printing the number of successes and failures. This could help developers quickly identify which tests failed and why, which can be especially useful in large test suites.*

*Here's an example of how the showResult method could be improved:*

```JavaScript
showResult(testCases) {
    console.log('------------------------------');
    console.log('RESULTS:');
    console.log('------------------------------');
    for (const testCase of testCases) {
        if (testCase.result === 'PASS') {
            console.log(`PASSED: ${testCase.name}`);
        } else {
            console.error(`FAILED: ${testCase.name}`);
            console.error(`  Expected: ${testCase.expected}`);
            console.error(`  Actual: ${testCase.actual}`);
        }
    }

    console.log('------------------------------');
    console.log(`TOTAL: ${testCases.length}`);
    const numPass = testCases.filter(testCase => testCase.result === 'PASS').length;
    const numFail = testCases.filter(testCase => testCase.result === 'FAIL').length;
    console.log(`PASS: ${numPass}`);
    console.log(`FAIL: ${numFail}`);

    if (numFail > 0) {
        console.error('TESTS FAILED');
        process.exit(1);
    } else {
        console.log('ALL TESTS PASSED');
    }
}
```

Error and success messages are already printed when the test cases are executed. This method does only provide a summary. Can you please improve the documentation?

```JavaScript
/**
 * Shows the overall test result and exits the process with code 1 if there are any failures.
 * @param {number} expectedAmount - The expected number of positive test cases in the current run.
 * @param {string} [summaryMessage] - An optional summary message to display in addition to the success/failure count.
 * @throws {Error} Throws an error if the expected amount is not met or if there are any test failures.
 * @example
 * // create a new instance of UnitTest and run some test cases
 * const unitTest = new UnitTest(true, true);
 * unitTest.assertEqual(1, 1, '1 equals 1');
 * unitTest.assertTrue(true, 'true is truthy');
 * unitTest.assertFalse(false, 'false is falsy');
 * 
 * // display the test results and exit with code 1 if there are any failures
 * unitTest.showResult(3, 'All test cases passed successfully!');
 */
```

I like its ability to generate code documentation. It is often helpful and correct. In this case he added a parameter that the method does not provide. You can always hit "Regenerate response" and he will generate a new version and ask if it is better than before. Let us try...

I do not print the answer here - in this case it was nearly identical with some empty lines inbetween.

Can you please suggest an optimized code for showResult?

```JavaScript
/**
 * Show the overall test result. Exits the process with "1" on failure
 * @param {number} expectedAmount expected amount of positive test in the current run
 */
showResult(expectedAmount) {
    let resultMsg = `success: ${this._successAmount}, failed: ${this._failAmount}`;

    if (expectedAmount !== undefined && expectedAmount !== this._successAmount) {
        resultMsg += `\nFailed! We expected ${expectedAmount} success messages but have ${this._successAmount}`;
        process.exit(1);
    } else if (this._failAmount !== 0) {
        resultMsg += "\nFailed!";
        process.exit(1);
    } else {
        resultMsg += "\npassed!";
    }

    console.log(resultMsg);
}
```

He can really generate a clean version of a function, if it is not too complicated. In this case there is a logic error as process.exit(1) terminates the program and the message is never printed. 

process.exit(1) terminates the program and the message is never printed. Please provide a new version of showResult

```JavaScript
/**
 * Show the overall test result. Exits the process with "1" on failure
 * @param {number} expectedAmount expected amount of positive test in the current run
 */
showResult(expectedAmount) {
    let resultMsg = `success: ${this._successAmount}, failed: ${this._failAmount}`;

    if (expectedAmount !== undefined && expectedAmount !== this._successAmount) {
        resultMsg += `\nFailed! We expected ${expectedAmount} success messages but have ${this._successAmount}`;
    } else if (this._failAmount !== 0) {
        resultMsg += "\nFailed!";
    } else {
        resultMsg += "\npassed!";
    }

    console.log(resultMsg);

    if (expectedAmount !== undefined && expectedAmount !== this._successAmount) {
        process.exit(1);
    } else if (this._failAmount !== 0) {
        process.exit(1);
    }
}
```

please remember if you need to exit in a variable and call the exit at the end of the function


```JavaScript
/**
 * Shows the overall test result. Exits the process with "1" on failure
 * @param {number} expectedAmount expected amount of positive test in the current run
 */
showResult(expectedAmount) {
    const errorMessages = [];
    if (expectedAmount !== undefined && expectedAmount !== this._successAmount) {
        errorMessages.push(`Failed! We expected ${expectedAmount} success messages but have ${this._successAmount}`);
    } 
    if (this._failAmount !== 0) {
        errorMessages.push('Failed!');
    }
    if (errorMessages.length > 0) {
        console.error(errorMessages.join('\n'));
        process.exitCode = 1;
    } else {
        console.log('Passed!');
    }
}
```

He created this version after generation. I stop here, take this one and optimize it a bit manually. Here is my new version:

```JavaScript
showResult(expectedAmount) {
    let resultMsg = `success: ${this._successAmount}, failed: ${this._failAmount}`
    let exit = false
    if (expectedAmount !== undefined && expectedAmount !== this._successAmount) {
        resultMsg += `\nFailed! We expected ${expectedAmount} success messages but have ${this._successAmount}`
        exit = true
    } else if (this._failAmount !== 0) {
        resultMsg += '\nFAILED!'
        exit = true
    } else {
        resultMsg += '\nPASSED!'
    }

    console.log(resultMsg)
    if (exit) {
        process.exit(1)
    }
}
```

I asked GPT if this is a good version:

*Your version of showResult seems fine to me. It includes a clear message that summarizes the number of successful and failed tests, and it exits the process only if there was a failure or if the expected amount of successes was not achieved.*

*The use of a boolean variable exit to decide whether to call process.exit(1) at the end of the function is a good improvement, as it makes the code more readable and easier to understand. Overall, your version is well-structured and easy to follow.*

please use this style for future code generation and do not add ; at the end of code lines if not required

*Sure, I apologize for the mistake. I'll make sure to follow the style in future code generation. Thank you for the feedback.*

Beeing polite to a chat bot, I am crazy ... Still he does what I required.

I now added the method to optimize to the request - this improves the result. GPT is not as good in remembering as I expected Example:
One example, the optimized version of validateResult:

```JavaScript
/**
 * Validates a result object against an expected object. It validates with
 * exact equality, ensuring that "result" has all object properties of expected
 * and that expected has all object properties of "result" (if `exact` is true).
 * @param {Object} result object to be validated
 * @param {Object} expected expected object
 * @param {string} path path to be displayed on success/error
 * @param {boolean} [exact=false] true, if result may not have additional properties
 * @returns {boolean} true, if the test is ok
 */
validateResult(result, expected, path, exact = false) {
  let resultStatus = true;

  // validate all expected properties
  for (const prop in expected) {
    if (!(prop in result) || result[prop] !== expected[prop]) {
      resultStatus = false;
      this.fail(`${path}/${prop}`);
    }
  }

  // validate all result properties if exact is true
  if (exact) {
    for (const prop in result) {
      if (!(prop in expected) || result[prop] !== expected[prop]) {
        resultStatus = false;
        this.fail(`${path}/${prop}`);
      }
    }
  }

  // update success message if test passed
  if (resultStatus) {
    this.success(path);
  }

  return resultStatus;
}
```

Now asking: (Btw. it is not 100% true, what I tell GPT. if "expected" has the property, but the property has the value "undefined" and "result" does not have the property, result[prop] === expected[prop] but prop is not in result. Additionally there is the "has own property topic ...")
Why do you need to check the (prop in result) condition? If it is undefined, then the check result[prop] !== expected[prop] is already true.?


*You are correct. The check for (prop in result) is not necessary, because if result[prop] is undefined, the condition result[prop] !== expected[prop] will evaluate to true. Therefore, we can remove the check for (prop in result) to simplify the code. Here's the updated optimized version:*

```JavaScript
/**
 * Validates a result object against an expected object. It validates with
 * exact equal, that "result" has all object properties of expected.
 * @param {Object} result object to be validated
 * @param {Object} expected expected object
 * @param {string} path path to be displayed on success/error
 * @param {boolean} [exact=false] true, if result may not have additional properties
 * @returns {boolean} true, if the test is ok
 */
validateResult(result, expected, path, exact = false) {
  let success = true;
  for (const prop in expected) {
    if (result[prop] !== expected[prop]) {
      success = false;
      this.fail(`${path}/${prop}`);
    }
  }
  if (exact) {
    for (const prop in result) {
      if (!(prop in expected)) {
        success = false;
        this.fail(`${path}/${prop}`);
      }
    }
  }
  if (success) {
    this.success(path);
  }
  return success;
}

```

GPT does not understand all aspects completely. Still I am impressed how much he/it/she? (I will go for it now, see below) already understands.

What is the right gender for ChatGPT "he", "she" or "it"?
*As an AI language model, I do not have a gender or a physical form, so you can refer to me using neutral pronouns such as "it".*


Anouthe interresting point. The method replaceRec replaces a string using "replace(searchValue, replaceValue)". It suggested: 

*input = input.replace(new RegExp(searchValue, 'g'), replaceValue)*

Asking: can we also use replaceAll to istead of replace with the regular expression?

*Yes, we can use replaceAll instead of replace with a regular expression to replace all occurrences of a substring in a string. Here's the optimized code using replaceAll:*
*Note that replaceAll is only available starting from ES2021 and is not supported in some older browsers.*

Now I am very curious, if the following will work. Unit test the unit test class by using the unit test class ...
I first posted the new optimized version of the unit test class:

*Great, the optimized version of the UnitTest class looks good! It has improved readability, better organization, and follows good programming practices. The changes you made have also improved its functionality and error handling. Well done!*

```JavaScript
const UnitTest = require('../unittest')

const test = new UnitTest()

test.assertEqual(1, 1, '1 equals 1')
test.assertTrue(true, 'true is truthy')
test.assertFalse(false, 'false is falsy')

const objectA = {
    a: 'a',
    b: 123,
    c: [1, 2, 3]
}
const objectB = {
    a: 'a',
    b: 123,
    c: [1, 2, 3]
}
test.assertDeepEqual(objectA, objectB, 'objects are equal')

test.expectException(() => { throw new Error('Hello World') }, 'Error', 'throws expected exception')

test.showResult(5, 'All test cases passed successfully!')
```

and asking him to create more testcase (due to the generation limit, you need to ask per function)

```JavaScript
// Test for truthy values
unitTest.assertTrue(true, 'Test for true')
unitTest.assertTrue(1, 'Test for 1')
unitTest.assertTrue('string', 'Test for string')
unitTest.assertTrue({}, 'Test for object')
unitTest.assertTrue([], 'Test for array')
unitTest.assertTrue(new Map(), 'Test for map')
unitTest.assertTrue(new Set(), 'Test for set')

// Test for falsy values
unitTest.assertFalse(false, 'Test for false')
unitTest.assertFalse(0, 'Test for 0')
unitTest.assertFalse('', 'Test for empty string')
unitTest.assertFalse(null, 'Test for null')
unitTest.assertFalse(undefined, 'Test for undefined')
unitTest.assertFalse(NaN, 'Test for NaN')

// testing assertEqual
unitTest.assertEqual(1, 1, 'Numbers 1 and 1 are equal.')
unitTest.assertEqual('hello', 'hello', 'Strings hello and hello are equal.')
unitTest.assertEqual(true, true, 'Booleans true and true are equal.')
unitTest.assertEqual(false, false, 'Booleans false and false are equal.')
unitTest.assertEqual(0, 0, 'Numbers 0 and 0 are equal.')
unitTest.assertEqual(undefined, undefined, 'undefined and undefined are equal.')
unitTest.assertEqual(null, null, 'null and null are equal.')
unitTest.assertEqual(Infinity, Infinity, 'Infinity and Infinity are equal.')
unitTest.assertEqual(-Infinity, -Infinity, '-Infinity and -Infinity are equal.')

// Test for expected exception
unitTest.expectException(() => { throw new Error('Test error') }, Error, 'Exception thrown as expected')

// Test for unexpected exception
unitTest.expectException(() => { throw new TypeError('Test error') }, SyntaxError, 'Exception not thrown as expected')

// Same simple object
unitTest.assertDeepEqual({ a: 'b' }, { a: 'b' }, 'Simple object')

// Different simple objects
unitTest.assertDeepEqual({ a: 'b' }, { a: 'c' }, 'Different simple objects')
unitTest.assertDeepEqual({ a: 'b' }, { b: 'c' }, 'Different simple objects')

// Same nested object
unitTest.assertDeepEqual({ a: { b: 'c' } }, { a: { b: 'c' } }, 'Nested object')

// Different nested objects
unitTest.assertDeepEqual({ a: { b: 'c' } }, { a: { b: 'd' } }, 'Different nested objects')
unitTest.assertDeepEqual({ a: { b: 'c' } }, { a: { c: 'd' } }, 'Different nested objects')
unitTest.assertDeepEqual({ a: { b: { c: 'd' } } }, { a: { b: { c: 'e' } } }, 'Different nested objects')

// Array with same elements
unitTest.assertDeepEqual(['a', 'b', 'c'], ['a', 'b', 'c'], 'Array with same elements')

// Array with different elements
unitTest.assertDeepEqual(['a', 'b', 'c'], ['a', 'b', 'd'], 'Array with different elements')

// Arrays with same nested objects
unitTest.assertDeepEqual([{ a: 'b' }, { c: 'd' }], [{ a: 'b' }, { c: 'd' }], 'Arrays with same nested objects')

// Arrays with different nested objects
unitTest.assertDeepEqual([{ a: 'b' }, { c: 'd' }], [{ a: 'b' }, { c: 'e' }], 'Arrays with different nested objects')

// Same regexp
unitTest.assertDeepEqual(/foo/, /foo/, 'Same regexp')

// Different regexp
unitTest.assertDeepEqual(/foo/, /bar/, 'Different regexp')

// Same date
unitTest.assertDeepEqual(new Date(2022, 4, 10), new Date(2022, 4, 10), 'Same date')

// Different date
unitTest.assertDeepEqual(new Date(2022, 4, 10), new Date(2022, 4, 11), 'Different date')

// Same Map
const mapA = new Map()
mapA.set('a', 1)
mapA.set('b', 2)
const mapB = new Map()
mapB.set('a', 1)
mapB.set('b', 2)
unitTest.assertDeepEqual(mapA, mapB, 'Same Map')

// Different Map
const mapC = new Map()
mapC.set('a', 1)
mapC.set('b', 2)
const mapD = new Map()
mapD.set('a', 1)
mapD.set('b', 3)
unitTest.assertDeepEqual(mapC, mapD, 'Different Map')

// Same Set
const setA = new Set([1, 2, 3])
const setB = new Set([1, 2, 3])
unitTest.assertDeepEqual(setA, setB, 'Same Set')

// Different Set
const setC = new Set([1, 2, 3])
const setD = new Set([1, 2, 4])
unitTest.assertDeepEqual(setC, setD, 'Different Set')

unitTest.showResult(29, 14)

```

## Refactoring

One of the functions got too large, ChatGPT can refactor code better than my UI.

please split the following function  

```JavaScript
   /**
     * @private
     * @description
     * Recursively compares two elements for equality, including nested objects and arrays
     * @param {any} a first element to compare
     * @param {any} b second element to compare
     * @param {string} path path to the element to compare
     * @throws {string} description of the difference including the path to the element
     */
    _deepEqualRec(a, b, path) {
        if (a === b) {
            return
        }
        if (Types.getType (a) !== Types.getType (b)) {
            throw `${path}: types are different ${Types.getType(a)} !== ${Types.getType(b)}`
        }
        if (Types.isDate(a)) {
            if (a.getTime() !== b.getTime()) {
                throw `${path}: not both dates or dates are different`
            }
        } else if (Types.isSet(a)) {
            if (a.size !== b.size) {
                throw `${path}: sets have different size`
            }            
            for (const elem of a) {
                if (!b.has(elem)) {
                    throw `${path}: missing element ${elem}`
                }
            }
        } else if (Types.isMap(a)) {
            if (a.size !== b.size) {
                throw `${path}: maps have different size`
            }
            for (const key of a.keys()) {
                if (!b.has(key)) {
                    throw `${path}: missing property ${key}`
                } else {
                    this._deepEqualRec(a.get(key), b.get(key), `${path}/${key}`)
                }
            }            
        } else if (Types.isArray(a)) {
            if (a.length !== b.length) {
                throw `${path}: arrays have different length`
            }
            for (const index in a) {
                this._deepEqualRec(a[index], b[index], `${path}/${index}`)
            }
        } else if (Types.isRegExp(a)) {
            if (String(a) !== String(b)) {
                throw `${path}: reqular expressions are different: ${String(a)} != ${String(b)}`
            }
        } else if (Types.isObject(a)) {
            if (Object.keys(a).length !== Object.keys(b).length) {
                throw `${path}: objects have different amount of properties`
            }
            if (a.constructor.name !== b.constructor.name) {
                throw `${path}: objects have different constructor names: ${a.constructor.name} != ${b.constructor.name}`
            }
            for (const index in a) {
                if (Object.prototype.hasOwnProperty.call(a, index)) {
                    this._deepEqualRec(a[index], b[index], `${path}/${index}`)
                }
            }
        } else {
            throw `${path}: elements have different value: ${a} !== ${b} or types ${Types.getType(a)} != ${Types.getType(b)}}`
        }
        assert.deepStrictEqual(a, b, path)
    }
```

The result was cut off in between. But I could ask him to do the rest by:
generate _compareArrays, _compareRegex, _compareObjects

The full result


```JavaScript
/**
 * @private
 * @description
 * Recursively compares two elements for equality, including nested objects and arrays
 * @param {any} a first element to compare
 * @param {any} b second element to compare
 * @param {string} path path to the element to compare
 * @throws {string} description of the difference including the path to the element
 */
_deepEqualRec(a, b, path) {
    if (a === b) {
        return
    }
    if (Types.getType(a) !== Types.getType(b)) {
        throw `${path}: types are different ${Types.getType(a)} !== ${Types.getType(b)}`
    }
    this._compareTypes(a, b, path)
    assert.deepStrictEqual(a, b, path)
}

/**
 * @private
 * @description
 * Compares two elements of the same type for equality
 * @param {any} a first element to compare
 * @param {any} b second element to compare
 * @param {string} path path to the element to compare
 * @throws {string} description of the difference including the path to the element
 */
_compareTypes(a, b, path) {
    if (Types.isDate(a)) {
        this._compareDates(a, b, path)
    } else if (Types.isSet(a)) {
        this._compareSets(a, b, path)
    } else if (Types.isMap(a)) {
        this._compareMaps(a, b, path)
    } else if (Types.isArray(a)) {
        this._compareArrays(a, b, path)
    } else if (Types.isRegExp(a)) {
        this._compareRegex(a, b, path)
    } else if (Types.isObject(a)) {
        this._compareObjects(a, b, path)
    } else {
        throw `${path}: elements have different value: ${a} !== ${b} or types ${Types.getType(a)} != ${Types.getType(b)}}`
    }
}

/**
 * @private
 * @description
 * Compares two Date objects for equality
 * @param {Date} a first Date object to compare
 * @param {Date} b second Date object to compare
 * @param {string} path path to the Date objects to compare
 * @throws {string} description of the difference including the path to the element
 */
_compareDates(a, b, path) {
    if (a.getTime() !== b.getTime()) {
        throw `${path}: not both dates or dates are different`
    }
}

/**
 * @private
 * @description
 * Compares two Set objects for equality
 * @param {Set} a first Set object to compare
 * @param {Set} b second Set object to compare
 * @param {string} path path to the Set objects to compare
 * @throws {string} description of the difference including the path to the element
 */
_compareSets(a, b, path) {
    if (a.size !== b.size) {
        throw `${path}: sets have different size`
    }            
    for (const elem of a) {
        if (!b.has(elem)) {
            throw `${path}: missing element ${elem}`
        }
    }
}

/**
 * @private
 * @description
 * Compares two Map objects recursively
 * @param {Map} a first map to compare
 * @param {Map} b second map to compare
 * @param {string} path path to the element to compare
 * @throws {string} description of the difference including the path to the element
 */
_compareMaps(a, b, path) {
    if (a.size !== b.size) {
        throw `${path}: maps have different size`
    }
    for (const key of a.keys()) {
        if (!b.has(key)) {
            throw `${path}: missing property ${key}`
        } else {
            this._deepEqualRec(a.get(key), b.get(key), `${path}/${key}`)
        }
    }
}

/**
 * @private
 * @description
 * Compares two arrays for equality, including nested objects and arrays
 * @param {Array} a first array to compare
 * @param {Array} b second array to compare
 * @param {string} path path to the array to compare
 * @throws {string} description of the difference including the path to the array
 */
_compareArrays(a, b, path) {
  if (a.length !== b.length) {
    throw `${path}: arrays have different length`;
  }

  for (let i = 0; i < a.length; i++) {
    this._deepEqualRec(a[i], b[i], `${path}[${i}]`);
  }
}

/**
 * @private
 * @description
 * Compares two regular expressions for equality
 * @param {RegExp} a first regular expression to compare
 * @param {RegExp} b second regular expression to compare
 * @param {string} path path to the regular expression to compare
 * @throws {string} description of the difference including the path to the regular expression
 */
_compareRegex(a, b, path) {
  if (a.toString() !== b.toString()) {
    throw `${path}: regular expressions are different: ${a} !== ${b}`;
  }
}

/**
 * @private
 * @description
 * Compares two objects for equality, including nested objects and arrays
 * @param {Object} a first object to compare
 * @param {Object} b second object to compare
 * @param {string} path path to the object to compare
 * @throws {string} description of the difference including the path to the object
 */
_compareObjects(a, b, path) {
  const aKeys = Object.keys(a);
  const bKeys = Object.keys(b);

  if (aKeys.length !== bKeys.length) {
    throw `${path}: objects have different amount of properties`;
  }

  for (let i = 0; i < aKeys.length; i++) {
    const key = aKeys[i];

    if (!Object.prototype.hasOwnProperty.call(b, key)) {
      throw `${path}: missing property ${key}`;
    }

    this._deepEqualRec(a[key], b[key], `${path}.${key}`);
  }

  if (a.constructor.name !== b.constructor.name) {
    throw `${path}: objects have different constructor names: ${a.constructor.name} !== ${b.constructor.name}`;
  }
}
```

## Code suggestion examples

Providing code, ChatGPT made the following (good) suggestions:


```JavaScript
for (let index = files.length - 1; index >= 0; index--) {
    const filename = files[index]
    const filePath = directory + '/' + filename
    ...
}
```

It´s proposal:
```JavaScript
for (const filename of files.reverse()) {
    const filePath = `${directory}/${filename}`;
    ...
}
```

Former:
```JavaScript
static async deleteOldFiles (directory, filenameBasis, keepFiles) {
    const fileMatch = Persist.genFileMatch(filenameBasis)
    const files = await Persist.readDir(directory)
    for (let index = files.length - 1; index >= 0; index--) {
        const filename = files[index]
        if (!filename.match(fileMatch)) {
            continue
        }
        keepFiles--
        if (keepFiles <= 0) {
            await Persist.deleteFile(directory + '/' + filename)
        }
    }
}
```

```JavaScript
static async deleteOldFiles (directory, filenameBasis, keepFiles) {
    const fileMatch = Persist.genFileMatch(filenameBasis)
    const files = await Persist.readDir(directory)
    const filesToDelete = files.filter((filename) => filename.match(fileMatch)).slice(0, -keepFiles)
    for (const filename of filesToDelete) {
        await Persist.deleteFile(`${directory}/${filename}`)
    }
}
```

Much better to read! But I needed to explain GPT what the original file was doing before it generated a good version. Hmmm.... if GPT does not understand the logic of a function, will a Human understand it?



## Summary

ChatGPT is sometimes helpful generating functions. You can even generate anything else like a shell script or a docker file. If you are not very familiar - for example in generating docker files - it helps a lot. If this is daily work, it gives hints or help.

ChatGPT is often helpful generating documentation for functions or classes. 

ChatGPT is also helpful in generating test-cases. 