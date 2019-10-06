/**
 * ---------------------------------------------------------------------------------------------------
 * This software is licensed under the GNU LESSER GENERAL PUBLIC LICENSE Version 3. It is furnished
 * "as is", without any support, and with no warranty, express or implied, as to its usefulness for
 * any purpose.
 *
 * File:        test.js
 * Purpouse:    test file for Message
 *
 * Author:      Volker Böhm
 * Copyright:   Volker Böhm
 * Version:     1.0
 * ---------------------------------------------------------------------------------------------------
 */

const Message = require("./Message.js");

(() => {
    let message1 = new Message("/hello/world", "on", "test made");
    message1.addReason("added reason");
    let message2 = new Message("/hello/world", "off", "test made", new Date(0));
    console.log(message1);
    console.log(message2);
})();