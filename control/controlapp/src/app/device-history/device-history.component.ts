/**
 * ---------------------------------------------------------------------------------------------------
 * This software is licensed under the GNU LESSER GENERAL PUBLIC LICENSE Version 3. It is furnished
 * "as is", without any support, and with no warranty, express or implied, as to its usefulness for
 * any purpose.
 *
 * File:      device-history.component.ts
 *
 * Author:      Volker Böhm
 * Copyright:   Volker Böhm
 * ---------------------------------------------------------------------------------------------------
 */

import { Component, OnInit } from '@angular/core';
import { DeviceInfo } from '../device/device';

@Component({
    selector: 'app-device-history',
    templateUrl: './device-history.component.html',
    styleUrls: ['./device-history.component.css']
})

export class DeviceHistoryComponent implements OnInit {
    deviceTopic: string

    /**
     * Creates a device history component showing history information
     * @param device NEEDED and used in device-history.component.html
     */
    constructor(private device: DeviceInfo) {

    }
  
    ngOnInit() {
    }

}
