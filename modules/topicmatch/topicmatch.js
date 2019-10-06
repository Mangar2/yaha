/**
 * ---------------------------------------------------------------------------------------------------
 * This software is licensed under the GNU LESSER GENERAL PUBLIC LICENSE Version 3. It is furnished
 * "as is", without any support, and with no warranty, express or implied, as to its usefulness for
 * any purpose.
 *
 * File:        Connection.js
 * Purpouse:    Checks, if a topic matches a list of patterns. The pattern is bases on the MQTT
 *              pattern design. Every pattern has an associated value (used for QoS in MQTT)
 *              Topic structure slashes with strings in between:  /string1/string2/string3/...
 *              Pattern is like topic with the following whildcards: "+" and "#". The "+" matches
 *              any string, the "#" matches the rest of the topic.
 *              Examples
 *              /# matches anything
 *              /+ matches "/hello" but not "/hello/world"
 *              /hello/+/world matches "/hello/all the/world"
 *              
 *              If several topics are matching, you can get all, the first or the best - i.e. the 
 *              pattern with the best value associated to it. 
 *              
 *
 * Author:      Volker Böhm
 * Copyright:   Volker Böhm
 * Version:     1.0
 * ---------------------------------------------------------------------------------------------------
 */

'use strict';
module.exports = class TopicMatch {

    /**
     * Contructs a new class
     * @param {object} topicPatternList optional: data structure load from file to rebuild topicMatch
     *                                  the object has the structure {pattern: value, pattern: value, ...}
     */
    constructor(topicPatternList) {
        if (typeof(topicPatternList) !== "object") {
            this.topicPatternList = {};
        } else {
            this.topicPatternList = topicPatternList;
        }
    }

    /**
     * Checks, if topics matches
     * @param {string} topic topic to check
     * @param {string} pattern topic with wildchards to pattern
     */
    static isTopicMatching(topic, pattern) {
        var topicElements = topic.split("/");
        var patternElements = pattern.split("/");
        let patternIsLonger = patternElements.length > topicElements.length;
        let patternIsShorter = patternElements.length < topicElements.length;
        var matches = !patternIsLonger;

        for (var index = 0; (index < patternElements.length) && matches; index++) {
            let curPatternElement = patternElements[index];
            let curTopicElement = topicElements[index];
            if (curPatternElement === "#") {
                break;
            }
            let isLastElementInPatternList = (index === patternElements.length - 1);
            if (isLastElementInPatternList && patternIsShorter) {
                matches = false;
            } else if (curPatternElement !== '+' && curPatternElement !== curTopicElement) {
                matches = false;
            } else if (curTopicElement === '#') {
                matches = false;
            }
        }
        return matches;
    }

    /**
     * Adds a pattern string to the patternlist (if not already included)
     * @param {string} pattern 
     * @param {any} value value associated with the pattern
     * @throws {Error} if pattern is not string or value is not provided
     */
    setPattern(pattern, value) {
        if (value === undefined) {
            throw Error("value undefined in setPattern");
        }
        if (typeof(pattern) !== 'string') {
            throw Error("undefined pattern in setPattern");
        }
        if (Array.isArray(pattern)) {
            for (let curPattern of pattern) {
                this.topicPatternList[curPattern] = value;
            }
        } else {
            this.topicPatternList[pattern] = value;
        }
    }

    /**
     * Removes all pattern from the list matching the provided patterns. A "removePattern("#")" will for 
     * example remove all stored patterns
     * @param {array|string} pattern string or array of strings containing patterns to delete  
     */
    removePattern(pattern) {
        if (pattern === undefined) {
            throw Error("undefined pattern in removePattner");
        }
        if (!Array.isArray(pattern)) {
            pattern = [pattern];
        }
        for (let deletePattern of pattern) {    
            for (let curPattern in this.topicPatternList) {
                if (TopicMatch.isTopicMatching(curPattern, deletePattern)) {
                    delete this.topicPatternList[curPattern];
                }
            }
        }
    }

    /**
     * Sets, adds and/or removes pattern.
     * @param {object} patternCommand object with attributes "set, remove, add" and a pattern list
     */
    changePattern(patternCommand) {
        if (patternCommand.set !== undefined) {
            this.removePattern("#");
            this.setPattern(patternCommand.set.pattern, patternCommand.set.value);
        } else if (patternCommand.remove !== undefined) {
            this.removePattern(patternCommand.remove);
        }
        if (patternCommand.add !== undefined) {
            this.setPattern(patternCommand.add.pattern, patternCommand.add.value);
        }
    }

    /**
     * Gets a list of matching pattern
     * @param {string} searchTopic topic to search for
     * @returns {object} all matching topics {topic1: value, topic2: value, ...}
     */
    getAllMatchingPattern(searchTopic) {
        var result = {};
        for (let curPattern in this.topicPatternList) {
            if (this.isTopicMatching(searchTopic, curPattern)) {
               result[curPattern] = this.topicPatternList[curPattern];
            }
        }
        return result;
    }

    /**
     * Gets the value of the first matching pattern. 
     * @param {string} searchTopic topic to search for
     * @param {function(newValue, currentValue)|undefined} isBetter function deciding, if newValue is better than currentValue
     * @return {any|undefined} value associated with the found topic or undefined, if nothing matches
     */
    getFirstMatch(searchTopic) {
        var result;
        for (let curPattern in this.topicPatternList) {
            if (TopicMatch.isTopicMatching(searchTopic, curPattern)) {
                result = this.topicPatternList[curPattern];
                break;
            }
        }
        return result;
    }


    /**
     * Gets the best value of all matching pattern according the compare function. 
     * If no compare function is provided, the values of the patterns are compared with the ">" operator
     * @param {string} searchTopic topic to search for
     * @param {function(newValue, currentValue)} isBetter(a, b) function deciding, if "a" is better than "b"
     * @return {any} value associated with the best found topic or undefined, if nothing matches
     */
    getBestMatch(searchTopic, isBetter) {
        var result;
        for (let curPattern in this.topicPatternList) {
            if (TopicMatch.isTopicMatching(searchTopic, curPattern)) {
                let curValue = this.topicPatternList[curPattern];
                if (result === undefined) {
                    result = curValue;
                } else if (isBetter === undefined && curValue > result) {
                    result = curValue;
                } else if (isBetter(curValue, result)) {
                    result = curValue;
                }
            }
        }
        return result;
    }

}