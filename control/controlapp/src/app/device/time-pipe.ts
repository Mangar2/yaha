import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'localTime'
})
export class LocalTimePipe implements PipeTransform {

    isToday = function(date) {
        let todaysDate = new Date();
        return date.setHours(0,0,0,0) === todaysDate.setHours(0,0,0,0);
    }
    
    transform(dateAsString: string, addDate: boolean): string {
        let date = new Date(dateAsString)
        if (dateAsString === undefined || dateAsString === "" || isNaN(date.getTime())) {
            return dateAsString ? dateAsString : 'unknown'
        }
        const timeStr = date.toLocaleTimeString()
        const dateStr = this.isToday(date) ? 'Today' :
            date.toLocaleDateString('de-DE', {day: "2-digit", month: "2-digit", year: "2-digit"} )
        const result = addDate ? dateStr + ", " + timeStr : timeStr;
        return result
    }

}