import { ViewChild, Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { Chart } from '../../Chart.js'
import { timer } from 'rxjs';

import { DeviceInfo } from '../device/device';

@Component({
    selector: 'app-device-chart',
    templateUrl: './device-chart.component.html',
    styleUrls: ['./device-chart.component.css']
})
export class DeviceChartComponent implements OnInit {
    @ViewChild('lineChart', { static: false }) private chartRef;
    chart = []

    constructor(public device: DeviceInfo) { }

    createChart() {
        const now = new Date()
        now.setHours(0, 0, 0, 0)
        const data = []
        console.log(this.device)
        if (this.device.history === undefined) { console.log("undefined") }
        if (this.device.history) {
            for (let entry of this.device.history) {
                const curTime = new Date(entry.time)
                if (curTime < now) {
                    break;
                }
                data.push({ t: curTime, y: entry.value })
            }
        }
        console.log(data)
        const options = {
            type: 'line',
            data: {
                datasets: [
                    {
                        label: this.device.name,
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
        var ctx = canvas.getContext("2d");
        this.chart = new Chart(ctx, options);
    }

    ngOnInit() {
        const pollForUpdate = timer(5, 2 * 1000)
        pollForUpdate.subscribe(() => {
           this.createChart()
        })

    }

}
