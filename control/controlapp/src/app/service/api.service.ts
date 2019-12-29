/**
 * ---------------------------------------------------------------------------------------------------
 * This software is licensed under the GNU LESSER GENERAL PUBLIC LICENSE Version 3. It is furnished
 * "as is", without any support, and with no warranty, express or implied, as to its usefulness for
 * any purpose.
 *
 * File:      api.service.ts
 *
 * Author:      Volker Böhm
 * Copyright:   Volker Böhm
 * ---------------------------------------------------------------------------------------------------
 */

import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';

import { Observable } from 'rxjs';
import { Payload } from '../device/device'

/**
 * Result structure of a publish command
 */
interface PublishResult {    
    result: string;
}

/**
 * Data structure to transport information about devices
 */
interface DeviceInfo {
    topics: string[];
    payload: Payload;
}

@Injectable({
  providedIn: 'root'
})
export class ApiService {

    constructor(private http: HttpClient) { console.log("api created") }

    /**
     * Gets device infos from the server
     * @param topic topic string to identify the device
     * @param history true, if history data will be added
     * @param levelAmount amount of data level to retrieve
     */
    getDevice(topic: string, history: boolean, levelAmount: number = 1): Observable<HttpResponse<DeviceInfo>> {
        const data = {
            topic,
            history: history ? "true" : "false",
            levelAmount
        }
        return this.http.post<DeviceInfo>("angular/api/sensor.php", data, { observe: 'response' });
    }

    /**
     * publish data to the sensor interface
     * @param http http client used to send data
     * @param topic topic to look for
     * @param value value to set
     */
    publish (topic: string, value: string ): Observable<HttpResponse<PublishResult>> {
        const data = {
            topic: topic + '/set',
            value: value,
            timestamp: (new Date()).toISOString()
        }
        return this.http.post<PublishResult>("angular/api/publish.php", data, { observe: 'response' });
    }

}
