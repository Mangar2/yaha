/**
 * ---------------------------------------------------------------------------------------------------
 * This software is licensed under the GNU LESSER GENERAL PUBLIC LICENSE Version 3. It is furnished
 * "as is", without any support, and with no warranty, express or implied, as to its usefulness for
 * any purpose.
 *
 * File:        Persist.js
 * Purpouse:    This class supports simple persistence of data (not transaciton safe). 
 *              To get around the need of any type of database it just stores one JSON structure 
 *              in a file and keep some older files of older data. 
 *              If the acutal file is corrupted, the class will read the last valid version. 
 *
 * Author:      Volker Böhm
 * Copyright:   Volker Böhm
 * Version:     1.0
 * ---------------------------------------------------------------------------------------------------
 */

'use strict';

const fs = require("fs");
const assert = require("assert");

module.exports = class Persist {
    
    /**
     * Creates a new persistance support class
     * supported options:
     * keepFiles : amount of file versions to keep (including the recently written file)
     * @param {object} configuration configuration options
     * 
     */
    constructor(configuration) {
        this.configuration = configuration;
        if (this.configuration === undefined) {
            this.configuration = {};
        }
        if (isNaN(this.configuration.keepFiles)) {
            this.configuration.keepFiles = 5;
        }
        this.writeTimestamp = Date.now();
    }

    /**
     * Checks, if we are currently writing a file
     */
    isWritingFile() {
        return this.writeTimestamp === undefined;
    }

    /**
     * Checks, if the last write timestamp is longer ago than a privided amount of seconds.
     * @param {number} timeoutInSeconds if the file is older than ...
     * @returns {boolean} true, if the file is outdated
     */
    fileIsOutdated(timeoutInSeconds) {
        var fileIsOutdated = false;
        if (!this.isWritingFile()) {
            const ONE_SECOND_IN_MILLISECONDS = 1000;
            var fileIsOutdated = (Date.now() - this.writeTimestamp) > timeoutInSeconds * ONE_SECOND_IN_MILLISECONDS;
        }
        return fileIsOutdated;
    }


    /**
     * Gets the local time in ISO string format
     * @returns {string} local time in ISO string format
     */
    static getLocalTimeAsISOString() {
        var tzoffsetInMinutes = (new Date()).getTimezoneOffset() * 60000;
        var localISOTime = (new Date(Date.now() - tzoffsetInMinutes)).toISOString().slice(0, -1);
        return localISOTime;
    }

    /**
     * deletes a file
     * @param {string} filePath string with filename (including path)
     * @returns {promise}
     */
    static async deleteFile(filePath) {
        return new Promise((resolve, reject) => { 
            fs.unlink(filePath, err => {
                if (err) {
                    reject(err);
                } else {
                    resolve();
                }
            })
        });
    }

    /**
     * writes a file
     * @param {string} fileAndPathName filename (including path)
     * @param {string} data data to be saved
     * @returns {promise}
     */
    static async writeFile(fileAndPathName, data) {
        return new Promise((resolve, reject) => { 
            fs.writeFile(fileAndPathName, data, (err) => {
                if (err) {
                    reject(err);
                } else {
                    console.log("written %s", fileAndPathName);
                    resolve();
                }
            })
        });
    }

    /**
     * Reads a directory and sorts it
     * @param {string} directory directory to read and sort files
     * @returns {promise} sorted list of files 
     */
    static async readDir(directory) {
        return new Promise((resolve, reject) => {
            fs.readdir(directory, (err, files) => {
                if (err) {
                    reject(err);
                } else {
                    files.sort();
                    resolve(files);
                }
            })
        });
    }

    /**
     * Generates a regular expression to check, if a filename matches 
     * @param {string} filenameBasis basis file name
     */
    static genFileMatch(filenameBasis) {
        return new RegExp("^" + filenameBasis + "\\d{4}-\\d{2}-\\d{2}");
    }

    /**
     * Deletes old files from the data directory
     * @param {string} directory directory to delete file
     * @param {string} filenameBasis basis filename of the file.  
     * @param {number} keepFiles amount of files to keep
     */
    static async deleteOldFiles(directory, filenameBasis, keepFiles) {
        let fileMatch = Persist.genFileMatch(filenameBasis);
        let files = await Persist.readDir(directory);
        for (let index = files.length - 1; index >= 0; index--) {
            let filename = files[index];
            if (!filename.match(fileMatch)) {
                continue;
            }
            keepFiles --;
            if (keepFiles <= 0) {
                await Persist.deleteFile(directory + "/" + filename);
            }
        }
    }

    /**
     * Stringifies a JSON and writes it to a file. 
     * It will automatically add a timestamp to the provided "base" filename
     * It does not throws errors, but logs write errors to the console
     * @param {string} directory directory to delete file
     * @param {string} filenameBasis basis filename of the file. The 
     * @param {object} objectToSafe object to save as JSON
     * @param {function} callback function(filepath) called, when file is written
     * @returns undefined
     */
    async saveObjectToFile(directory, filenameBasis, objectToSave) {
        assert(typeof(filenameBasis) === 'string', "saveObjectToFile without filename");
        assert(typeof(directory) === 'string', "saveObjectToFile without directory");
        assert(typeof(objectToSave) !== "undefined", "object to save is undefined");

        var dateString = Persist.getLocalTimeAsISOString();
        dateString = dateString.replace(/:/g, '');
        var filePath = directory + "/" + filenameBasis + dateString + ".json";

        try {
            if (!this.isWritingFile()) {
                this.writeTimestamp = undefined;
                var dataString = JSON.stringify(objectToSave);
                await Persist.writeFile(filePath, dataString);
                await Persist.deleteOldFiles(directory, filenameBasis, this.configuration.keepFiles);
                this.writeTimestamp = Date.now();
            }
        } catch (err) {
            console.error(err);
            this.writeTimestamp = Date.now();
        }
    }

    /**
     * Reads the newest file from an array of files, beginning with the last filename in the array
     * It stops, when one file could be read successfully
     * @param {string} directory directory to delete file
     * @param {string} filenameBasis basis filename of the file. The 
     * @param {array} files array of filenames in the current directory
     * @returns {object} read data as object (created with JSON.parse)
     */
    static readNewestFile(directory, filenameBasis, files) {
        let fileMatch = Persist.genFileMatch(filenameBasis);
        let result;

        for (let index = files.length - 1; index >= 0; index--) {
            let filename = files[index];
            let filePath = directory + "/" + filename;
            if (filename.match(fileMatch)) {
                try {
                    var contents = fs.readFileSync(filePath);

                    if (contents !== undefined) {
                        result = JSON.parse(contents);
                        break;
                    }
                }
                catch (err) {
                    console.error(err);
                }
            }
        }
        return result;
    }

    /**
     * Reads data from a file
     * @param {string} directory directory to delete file
     * @param {string} filenameBasis basis filename of the file. The 
     * @returns {object} the object read.
     */
    readData(directory, filenameBasis) {
        var data;
        try {
            var files = fs.readdirSync(directory + "/");
            files.sort();
            data = Persist.readNewestFile(directory, filenameBasis, files);

        } catch (err) {
            data = undefined;
            console.error(err);
        }
        return data;
    }
}