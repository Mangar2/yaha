/**
 * ---------------------------------------------------------------------------------------------------
 * This software is licensed under the GNU LESSER GENERAL PUBLIC LICENSE Version 3. It is furnished
 * "as is", without any support, and with no warranty, express or implied, as to its usefulness for
 * any purpose.
 *
 * File:      device.ts
 *
 * Author:      Volker Böhm
 * Copyright:   Volker Böhm
 * ---------------------------------------------------------------------------------------------------
 */

/**
 * Reason structure describing the reason of an action
 */
interface Reason {
    timestamp: string,
    message: string
}

/**
 * Message of a device
 */
export interface Message {
    topic: string;
    value: string;
    reason: Reason[];
}

/**
 * History data from Device
 */
export interface History {
    messages: Message[];
}

/**
 * Follow up links to related device
 */
interface Links {
    rel: string;
    href: string;
}

/**
 * Payload including all the data
 */
interface Payload {
    current: Message;
    statistics: any;
    history: any;
}

/**
 * Data structure to transport information about devices
 */
export interface DeviceInfo {
    links: Links;
    payload: Payload;
}

/**
 * Result structure of a publish command
 */
export interface PublishResult {    
    result: string;
}


