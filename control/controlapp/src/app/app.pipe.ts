import { Pipe, PipeTransform } from '@angular/core';

import { Device } from './device/device'

@Pipe({
  name: 'location'
})
export class LocationPipe implements PipeTransform {

  transform(devices: Device[], filter: string): any {
        console.log(devices)
        return devices.filter(device => {
            const result = device.topic.startsWith(filter)
            return result
        });
  }

}