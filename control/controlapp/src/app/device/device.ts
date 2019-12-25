import { devices } from '../devices';

export interface Reason {
    timestamp: string;
    message: string;
}

export interface Message {
    topic?: string;
    value: string | number;
    reason?: Reason[];
}

export interface Device {
    name?: string;
    topic?: string;
    value?: string;
    reason?: Reason[];
    history?: Message[];
}

/**
 * Updates the device
 * @param topic topic of the device
 * @param device the device object
 * @param data data read from server
 */
export function updateDevice(topic: string, device: Device, data: any): Device {
    if (data && data.payload && data.payload.current) {
        if (data.payload.current.topic === topic) {
            const value = data.payload.current.value
            const isOn = (value === 'on' || value === 'true' || value === true || value === '1' || value === 1)
            device.value = isOn ? 'on' : 'off'
        }
        if (Array.isArray(data.payload.current.reason)) {
            device.reason = data.payload.current.reason
        }
        if (Array.isArray(data.payload.history)) {
            device.history = data.payload.history
        }
    }
    return device
}

/**
 * Searches the devices for a topic
 * @param topic 
 */
export function getDevice (topic: string): Device | undefined {
    let result
    for(const device of devices) {
        if (device.topic === topic) {
            result = device
            break
        }
    }
    return result
}

