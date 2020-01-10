import { ViewChild, Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { Chart } from '../../Chart.js'
import { timer, Subscription } from 'rxjs';

import { DeviceSubject, DeviceInfo } from '../device/device';

@Component({
    selector: 'app-device-chart',
    templateUrl: './device-chart.component.html',
    styleUrls: ['./device-chart.component.css']
})
export class DeviceChartComponent implements OnInit {
    chart = []
    lastDataTime
    subscription: Subscription = new Subscription()

    constructor(public deviceSubject: DeviceSubject) { 
    }

    createChart(device: DeviceInfo) {
        const now = new Date()
        now.setHours(0, 0, 0, 0)
        const data = []
        if (device.history) {
            for (let entry of device.history) {
                const curTime = new Date(entry.time)
                if (curTime < now) {
                    //break;
                }
                data.push({ t: curTime, y: entry.value })
            }
        }
        const options = {
            type: 'line',
            data: {
                datasets: [
                    {
                        label: device.name,
                        cubicInterpolationMode: 'monotone',
                        borderColor: '#7cb5ec',
                        pointRadius: 1,
                        fill: false,
                        borderWidth: 2,
                        data
                    }
                ]
            },
            options: {
                legend: {
                    display: false
                },
                animation: {
                    duration: 0
                },
                scales: {
                    xAxes: [{
                        type: 'time',
                        time: {
                            displayFormats: {
                                minute: 'hh:mm'
                            }
                        },
                        distribution: 'linear',
                        scaleLabel: {
                            display: false,
                        }
                    }]
                }
            }
        }
        var canvas = <HTMLCanvasElement>document.getElementById("chartJSContainer");
        if (canvas) {
            var ctx = canvas.getContext("2d");
            this.chart = new Chart(ctx, options);
        }
    }

    ngOnInit() {
        this.subscription.add(this.deviceSubject.subscribe((device) => {
            const lastDataTime = device.history[0].time
            if (this.lastDataTime !== lastDataTime) {
                this.createChart(device)
            }
            this.lastDataTime = lastDataTime
        }))
    }

    ngOnDestroy() {
        this.subscription.unsubscribe()
    }

}
