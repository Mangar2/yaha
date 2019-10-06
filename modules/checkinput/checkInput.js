/**
 * ---------------------------------------------------------------------------------------------------
 * This software is licensed under the GNU LESSER GENERAL PUBLIC LICENSE Version 3. It is furnished
 * "as is", without any support, and with no warranty, express or implied, as to its usefulness for
 * any purpose.
 *
 * File:      checkinput.js
 *
 * Author:      Volker Böhm
 * Copyright:   Volker Böhm
 * ---------------------------------------------------------------------------------------------------
 */

 'use scrict'

 module.exports = class CheckInput {

    /**
     * Creates a new input check class
     * @param {object} definition swagger like content defintion
     */
    constructor(definition) {
        this.definition = definition;
        this.messages;
    }

    /**
     * Checks a number variable against a defintion
     * @param {object} definition number definition
     * @param {string} variable input data
     * @returns {true | string} true, if the variable is correct, else an error message
     */
    checkNumber(definition, variable) {
        let result = true;
        if (typeof(variable) !== 'number') {
            result = ("'" + variable + "' is not a number");
        } else if (definition.minimum !== undefined && variable < definition.minimum) {
            result = (variable + " below " + definition.minimum);
        } else if (definition.maximum !== undefined && variable > definition.maximum) {
            result = (variable + " above " + definition.maximum);
        } 
        return result;
    }

    /**
     * Checks a string format
     * @param {string} format string format description
     * @param {string} variable variable to check
     */
    checkStringFormat(format, variable) {
        let result = true;
        switch (format) {
            case "date": result = variable.match(/^\d{4}-\d{2}-\d{2}$/) !== null; break;
            case "date-time": result = variable.match(/^\d{4}-\d{2}-\d{2}T\d{2}\:\d{2}\:\d{2}(.\d{3})?(Z|[+-]\d{2}\:\d{2})$/) !== null; break;
        }
        if (result === false) {
            result = "'" + variable + "' is not a " + format;
        }
        return result;
    }

    /**
     * Checks a string variable against a defintion
     * @param {object} definition string definition
     * @param {string} variable input data
     * @returns {true | string} true, if the variable is correct, else an error message
     */
    checkString(definition, variable) {
        let result = true;
        if (typeof(variable) !== 'string') {
            result = ("'" + variable + "' is not a string");
        } else if (definition.minLength !== undefined && variable.length < definition.minLength) {
            result = ("'" + variable + "' minimum length " + definition.minLength + " not reached");
        } else if (definition.maxLength !== undefined && variable.length > definition.maxLength) {
            result = ("'" + variable + "'  maximum length " + definition.maxLength + " exceeded");
        } else if (definition.format !== undefined) {
            result = this.checkStringFormat(definition.format, variable);
        }
        return result;
    }

    /**
     * Checks a variable against a defintion
     * @param {object} definition variable definition
     * @param {string | number} variable input data
     * @returns {boolean} true, if the variable matches the definition
     */
    checkType(definition, variable) {
        let result = true;
        switch (definition.type) {
            case 'string': result = this.checkString(definition, variable); break;
            case 'number': result = this.checkNumber(definition, variable); break;
            case 'array': result = this.checkArray(definition, variable); break;
            case 'object': result = this.checkObject(definition, variable); break;
        }
        return result;
    }

    /**
     * Checks an object against a definition
     * @param {object} definition object definition
     * @param {object} object input data
     * @returns {boolean} true, if the object matches the definition
     */
    checkObject(definition, object) {
        let result = typeof(object) === 'object';
        if (definition.required !== undefined) {
            for(let property of definition.required) {
                if (result === false) {
                    break;
                }
                result = result & (object[property] !== undefined);
            }
        }
        if (definition.properties !== undefined) {
            for (let property in definition.properties) {
                if (result === false) {
                    break;
                }
                if (object[property] !== undefined) {
                    result &= this.checkType(definition.properties[property], object[property]);
                }
            }
        }
        return result;
    }

    /**
     * Checks an array against a definition
     * @param {object} definition array definition
     * @param {array} array input data
     */
    checkArray(definition, array) {
        let result = Array.isArray(array);
        if (definition.minItems !== undefined) {
            result &= array.length >= definition.minItems;
        }
        if (definition.maxItems !== undefined) {
            result &= array.length <= definition.maxItems;
        }
        if (result) {
            for(let item of array) {
                result &= this.checkType(definition.items, item);
                if (!result) {
                    break;
                }
            }
        }
        return result;
    }

    /**
     * Checks an object against a swagger defintion
     * @param {object} data data to check against definition
     * @returns {boolean} true, if the data matches to the definition
     */
    check(data) {
        let result;
        let check = this.checkType(this.definition, data);
        if (check === true) {
            result = true;
        } else {
            result = false;
            this.messages = check;
        }
        return result;
    }
 }