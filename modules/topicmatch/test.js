/**
 * ---------------------------------------------------------------------------------------------------
 * This software is licensed under the GNU LESSER GENERAL PUBLIC LICENSE Version 3. It is furnished
 * "as is", without any support, and with no warranty, express or implied, as to its usefulness for
 * any purpose.
 *
 * File:        test.js
 * Purpouse:    test file for topicMatch
 *
 * Author:      Volker Böhm
 * Copyright:   Volker Böhm
 * Version:     1.0
 * ---------------------------------------------------------------------------------------------------
 */
const TopicMatch = require("./topicMatch.js")

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
            if (this.verbose) { console.log("success: " + text); }
        } else {
            this.fail++;
            console.error("failed: " + a + " != "  + b + " " + text);
        }
    }

}

var unitTest = new UnitTest(true);

function isMatching(pattern, topic) {
    let topicMatch = new TopicMatch();
    topicMatch.setPattern(pattern, 0);
    unitTest.assertEqual(topicMatch.getFirstMatch(topic), 0, pattern + " matches " + topic);
}

function isNotMatching(pattern, topic) {
    let topicMatch = new TopicMatch();
    topicMatch.setPattern(pattern, 0);
    unitTest.assertEqual(topicMatch.getBestMatch(topic), undefined, pattern + " does not match " + topic);
}

(() => {
    isNotMatching("/#", "");
    isMatching("/#", "/");
    isMatching("/#", "/hello");
    isMatching("/#", "/hello/world");
    isMatching("/#", "/hello/my/world");
    isNotMatching("/hello/#", "/");
    isNotMatching("/hello/#", "/#");
    isNotMatching("/hello/#", "/hello#");
    isNotMatching("/hello/#", "/hello");
    isNotMatching("/hello/#", "/hey");
    isMatching("/hello/#", "/hello/");
    isMatching("/hello/#", "/hello/world");
    isMatching("/hello/#", "/hello/my/world/#");
    isMatching("/hello/#", "/hello/my/world/+");
    isMatching("/aaa/+/bbb/+/ccc/#", "/aaa/AAA/bbb/BBB/ccc/CCC/ddd/DDD");
    isMatching("/aaa/+/bbb/+/ccc/#", "/aaa/A2/bbb/B2/ccc/C2/ddd/DDD");
    isMatching("/aaa/+/bbb/+/ccc/#", "/aaa/A2/bbb/B2/ccc//ddd/DDD");
    isNotMatching("/aaa/+/bbb/+/ccc/#", "/aa/AAA/bbb/BBB/ccc/CCC/ddd/DDD");
    isNotMatching("/aaa/+/bbb/+/ccc/#", "/aaa/AAA/bb/BBB/ccc/CCC/ddd/DDD");
    isNotMatching("/aaa/+/bbb/+/ccc/#", "/aaa/AAA/bbb/BBB/cc/CCC/ddd/DDD");
    isNotMatching("/aaa/+/bbb/+/ccc/#", "/aaa/AAA/bbb/BBB/cc1/CCC/ddd/DDD");
    isNotMatching("/aaa/+/bbb/+/ccc/#", "/aaA/AAA/bbb/BBB/ccc/CCC/ddd/DDD");
    isNotMatching("/aaa/+/bbb/+/ccc/#", "/aaa/AAA/bbb/BBB/ccc");
    isNotMatching("/aaa/+/bbb/+/ccc/#", "/aaaAAA/bbb/BBB/ccc/CCC/ddd/DDD");
    isNotMatching("/aaa/+/bbb/+/ccc/#", "/aaa/AAA/bbb/ccc/CCC/ddd/DDD");
    isNotMatching("/aaa/+/bbb/+/ccc/#", "/bbb/AAA/aaa/BBB/ccc/CCC/ddd/DDD");
    unitTest.showResult();

})()
