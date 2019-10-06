/**
 * ---------------------------------------------------------------------------------------------------
 * This software is licensed under the GNU LESSER GENERAL PUBLIC LICENSE Version 3. It is furnished
 * "as is", without any support, and with no warranty, express or implied, as to its usefulness for
 * any purpose.
 *
 * File:        test.js
 * Purpouse:    test file for errorlog
 *
 * Author:      Volker Böhm
 * Copyright:   Volker Böhm
 * Version:     1.0
 * ---------------------------------------------------------------------------------------------------
 */

 errorLog = require("./errorlog.js");

 errorLog("log the error message");
 errorLog(); // does nothing
 errorLog(new Error("Error class, following stack trace expected"));
