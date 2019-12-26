import { Pipe, PipeTransform } from '@angular/core';

import { Device } from './device/device'

@Pipe({
  name: 'location'
})
export class LocationPipe implements PipeTransform {

  transform(devices: Device[], filter: string): any {
        return devices.filter(device => {
            return device.topic.startsWith(filter)
        });
  }

}