import { Pipe, PipeTransform } from '@angular/core';
import { Reason } from './device'
import { LocalTimePipe } from './time-pipe'

@Pipe({
  name: 'reasonToText'
})
export class ReasonToTextPipe implements PipeTransform {

    transform(reason: Reason[]): string {
        let result: string = ''
        let spacer: string = ''
        let index = 1
        const localTime: LocalTimePipe = new LocalTimePipe()
        if (reason) {
            for (let entry of reason) {
                result = result + spacer + index + '. ' + entry.message + ' (' + localTime.transform(entry.timestamp, index === 1) + ')'
                spacer = ' '
                index++;
            }
        }
        return result
    }

}