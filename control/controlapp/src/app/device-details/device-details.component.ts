import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { devices } from '../devices';

@Component({
    selector: 'app-device-details',
    templateUrl: './device-details.component.html',
    styleUrls: ['./device-details.component.css']
})

export class DeviceDetailsComponent implements OnInit {
    device

    constructor(private route: ActivatedRoute) { }

    ngOnInit() {
        this.route.paramMap.subscribe(params => {
            this.device = devices[+params.get('deviceTopic')];
        });
    }

}