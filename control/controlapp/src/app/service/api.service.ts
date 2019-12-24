import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { DeviceInfo, PublishResult } from './deviceinfo';

import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ApiService {

    constructor(private http: HttpClient) { }

    /**
     * Gets device infos from the server
     * @param topic topic string to identify the device
     * @param history true, if history data will be added
     */
    getDevice(topic: string, history: boolean): Observable<HttpResponse<DeviceInfo>> {
        const data = {
            topic: topic,
            history: history
        }
        return this.http.post<DeviceInfo>("api/Arduino/NodeJs/html/sensor.php", data, { observe: 'response' });
    }

    /**
     * publish data to the sensor interface
     * @param http http client used to send data
     * @param topic topic to look for
     * @param value value to set
     */
    publish (topic: string, value: string ): Observable<HttpResponse<PublishResult>> {
        const data = {
            topic: topic,
            value: value,
            timestamp: (new Date()).toISOString()
        }

        return this.http.post<PublishResult>("api/Arduino/NodeJs/html/publish.php", data, { observe: 'response' });
    }

}
