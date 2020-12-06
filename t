[33mcommit 898ba8199bc0bcbca0bead9dbc46c7cb0a589a9e[m[33m ([m[1;36mHEAD -> [m[1;32mmaster[m[33m, [m[1;31morigin/master[m[33m, [m[1;31morigin/HEAD[m[33m)[m
Author: Mangar <Mangar@I3T1>
Date:   Sat Dec 5 23:09:49 2020 +0100

    reload automation

[1mdiff --git a/node_modules/@mangar2/runservices/registerautomation.js b/node_modules/@mangar2/runservices/registerautomation.js[m
[1mdeleted file mode 100644[m
[1mindex d948a4e..0000000[m
[1m--- a/node_modules/@mangar2/runservices/registerautomation.js[m
[1m+++ /dev/null[m
[36m@@ -1,103 +0,0 @@[m
[31m-/**[m
[31m- * @license[m
[31m- * This software is licensed under the GNU LESSER GENERAL PUBLIC LICENSE Version 3. It is furnished[m
[31m- * "as is", without any support, and with no warranty, express or implied, as to its usefulness for[m
[31m- * any purpose.[m
[31m- *[m
[31m- * @author Volker Böhm[m
[31m- * @copyright Copyright (c) 2020 Volker Böhm[m
[31m- */[m
[31m-[m
[31m-'use strict'[m
[31m-[m
[31m-const { errorLog, types } = require('@mangar2/utils')[m
[31m-const fs = require('fs')[m
[31m-[m
[31m-let automation[m
[31m-[m
[31m-/**[m
[31m- * @private[m
[31m- * @description Get/reads rules from files[m
[31m- * @param {string|Array} rules rules information.[m
[31m- * If type is string, rules are read from a file with the filename[m
[31m- * If type is Array, rules are read from an array of files (filenames)[m
[31m- * @returns {Object} set of rules[m
[31m- */[m
[31m-function readRules (filenames) {[m
[31m-    let result = {}[m
[31m-    if (types.isString(filenames)) {[m
[31m-        result = JSON.parse(fs.readFileSync(filenames))[m
[31m-    } else if (types.isArray(filenames)) {[m
[31m-        result = {}[m
[31m-        try {[m
[31m-            for (const fileName of filenames) {[m
[31m-                const fileRules = JSON.parse(fs.readFileSync(fileName))[m
[31m-                result = { ...result, ...fileRules }[m
[31m-            }[m
[31m-        } catch (err) {[m
[31m-            errorLog(err)[m
[31m-        }[m
[31m-    }[m
[31m-    return result[m
[31m-}[m
[31m-[m
[31m-/**[m
[31m- * Watches rule files and reloads them on change[m
[31m- * @param {Array|string} filenames name of the rule file(s)[m
[31m- */[m
[31m-/*[m
[31m-function watchRules (filenames) {[m
[31m-    if (types.isString(filenames)) {[m
[31m-        filenames = [filenames][m
[31m-    }[m
[31m-    for (const filename of filenames) {[m
[31m-        fs.watch(filename, { }, (eventType, filename) => {[m
[31m-            const rules = readRules(filenames)[m
[31m-            automation = new automation(config.automation, rules)[m
[31m-            const subscriptions = automation.getSubscriptions()[m
[31m-            mqttClient.subscriptions = subscriptions[m
[31m-        })[m
[31m-    }[m
[31m-}[m
[31m-*/[m
[31m-[m
[31m-/**[m
[31m- * @private[m
[31m- * @description Registers the automation service, if the configuration demands it[m
[31m- * @param {MqttClient} mqttClient client providing mqtt services[m
[31m- * @param {Object} config configuration data[m
[31m- * @param {Object} config.automation configuration for the automation service[m
[31m- * @param {Array} config.runservices.services configured services to install[m
[31m- */[m
[31m-function registerAutomation (mqttClient, config) {[m
[31m-    if (config.automation && config.runservices.services.includes('automation')) {[m
[31m-        try {[m
[31m-            const Automation = require('@mangar2/automation')[m
[31m-            // watchRules()[m
[31m-            automation = new Automation(config.automation)[m
[31m-[m
[31m-            const rules = readRules(config.automation.rules)[m
[31m-            automation.setRules(rules)[m
[31m-[m
[31m-            console.log('checking rules ...')[m
[31m-            const subscriptions = automation.getSubscriptions()[m
[31m-[m
[31m-            mqttClient.registerRecipient(subscriptions, (message) => {[m
[31m-                const setResponse = automation.processMessage(message)[m
[31m-                const result = automation.processRules()[m
[31m-                const messages = [...result.messages, ...setResponse][m
[31m-                return messages[m
[31m-            })[m
[31m-            mqttClient.registerSender(config.automation.intervalInSeconds * 1000, async () => {[m
[31m-                const result = automation.processRules()[m
[31m-                return result.messages[m
[31m-            })[m
[31m-[m
[31m-            console.log('started automation service')[m
[31m-        } catch (err) {[m
[31m-            errorLog(err, false)[m
[31m-        }[m
[31m-    }[m
[31m-}[m
[31m-[m
[31m-module.exports = registerAutomation[m
