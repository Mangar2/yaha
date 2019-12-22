import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'localTime'
})
export class LocalTimePipe implements PipeTransform {

    isToday = function(date) {
        let todaysDate = new Date();
        return date.setHours(0,0,0,0) === todaysDate.setHours(0,0,0,0);
    }
    
    transform(dateAsString: string): string {
        let date = new Date(dateAsString)
        if (dateAsString === undefined || dateAsString === "" || isNaN(date.getTime())) {
            return 'unknown'
        }
        const timeStr = date.toLocaleTimeString()
        const dateStr = this.isToday(date) ? 'Today' :
            date.toLocaleDateString('', {day: "2-digit", month: "2-digit", year: "2-digit"} )
        const result = dateStr + ", " + timeStr;
        return result
    }

}