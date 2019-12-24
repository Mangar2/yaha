
import { HttpClient } from '@angular/common/http';
/**
 * publish data to the sensor interface
 * @param http http client used to send data
 * @param topic topic to look for
 * @param value value to set
 */
export function publish (http: HttpClient, topic: string, value: string ): void {
    const data = {
        topic: topic,
        value: value,
        timestamp: (new Date()).toISOString()
    }

    http.post<string>("api/Arduino/NodeJs/html/publish.php", data).
        subscribe((data) => {console.log(data)})
}

/**
 * Sets a device value
 * @param topic topic of the device
 * @param value value to set
 */
export function setDeviceValue (http: HttpClient, topic: string, value: string): void {
    publish (http, topic + '/set', value)
}
