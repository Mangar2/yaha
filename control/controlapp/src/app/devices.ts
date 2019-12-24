import { pictures } from './pictures/pictures'

const deviceOnOff = {
    value: '',
    reason: [],
    actions: ['on', 'off']
}

export const devices = [
    {
        ...deviceOnOff,
        name: 'Main status',
        topic: 'system/presence',
        value: 'on',
        actions: ['present', 'absent', 'sleeping'],
        ...pictures.house
    },
    {
        ...deviceOnOff,
        name: 'Computer main power',
        topic: 'first/study/zwave/switch/master',
        value: 'on',
        ...pictures.powerSwitch
    },
    { 
        ...deviceOnOff,
        name: 'Backup computer',
        topic: 'ground/wardrobe/i2c/switch/backup',
        actions: ['on', 'hibernate', 'off'],
        ...pictures.backup
    },
    { 
        ...deviceOnOff,
        name: 'Charge',
        topic: 'ground/wardrobe/i2c/switch/charge',
        ...pictures.charge
    },    
    { 
        ...deviceOnOff,
        name: 'Monitor',
        topic: 'ground/wardrobe/i2c/switch/monitor',
        ...pictures.monitor
    },    
    { 
        ...deviceOnOff,
        name: 'Floor heating',
        topic: 'ground/wardrobe/fs20/switch/floor heating',
        ...pictures.floorHeating
    },    
    { 
        ...deviceOnOff,
        name: 'Network switch',
        topic: 'ground/wardrobe/i2c/switch/network switch',
        ...pictures.networkSwitch
    },    
    { 
        ...deviceOnOff,
        name: 'Security camera',
        topic: 'ground/livingroom/zwave/switch/camera',
        ...pictures.securityCamera
    },    
    { 
        ...deviceOnOff,
        name: 'Electric iron',
        topic: 'first/dressingroom/zwave/switch/electric iron',
        ...pictures.electricIron
    },
    {
        ...deviceOnOff,
        name: "Battery charging",
        topic: "ground/livingroom/zwave/switch/charge",
        ...pictures.charge
    },
    {
        ...deviceOnOff,
        name: "Ceiling floodlight",
        topic: "ground/livingroom/zwave/switch/floodlight",
        ...pictures.light
    },
    {
        ...deviceOnOff,
        name: "Roller shutter south-east",
        topic: "ground/livingroom/zwave/shutter/southeast",
        actions: ['up', 'down', 'stop'],
        ...pictures.roller
    },
    {
        ...deviceOnOff,
        name: "Roller shutter south-west",
        topic: "ground/livingroom/zwave/shutter/southwest",
        actions: ['up', 'down', 'stop'],
        ...pictures.roller
    },
    {
        ...deviceOnOff,
        name: "Master switch multimedia",
        topic: "ground/livingroom/zwave/switch/tvmaster",
        ...pictures.multimedia
    },
    {
        ...deviceOnOff,
        name: "Multimedia amplifier",
        topic: "ground/livingroom/fs20/switch/amplifier",
        ...pictures.amplifier
    },
    {
        ...deviceOnOff,
        name: "Apple TV",
        topic: "ground/livingroom/fs20/switch/appletv",
        ...pictures.computer
    },
    {
        ...deviceOnOff,
        name: "Dishwasher",
        topic: "ground/kitchen/zwave/switch/dishwasher",
        ...pictures.dishwasher
    },
    {
        ...deviceOnOff,
        name: "Refrigerator",
        topic: "ground/kitchen/zwave/switch/fridge",
        ...pictures.refrigerator
    },
    {
        ...deviceOnOff,
        name: "Ventilation system",
        topic: "ground/wardrobe/zwave/switch/ventilation",
        ...pictures.ventilationSystem
    },
    {
        ...deviceOnOff,
        name: "Smarthome Power",
        topic: "ground/wardrobe/zwave/switch/smarthome",
        ...pictures.powerSwitch
    },
    {
        ...deviceOnOff,
        name: "Smarthome server",
        topic: "ground/wardrobe/i2c/switch/server",
        actions: ['shutdown'],
        ...pictures.smarthomeServer
    },
    {
        ...deviceOnOff,
        name: "Internet router (fritz box)",
        topic: "ground/wardrobe/i2c/switch/internet",
        ...pictures.internet
    },
    {
        ...deviceOnOff,
        name: "Socket at parkingplace",
        topic: "outdoor/garden/main/switch/socketparkingplace",
        ...pictures.socket
    },   
    {
        ...deviceOnOff,
        name: "Socket at stonefield",
        topic: "outdoor/garden/main/switch/socketstonefield",
        ...pictures.socket
    },   
    {
        ...deviceOnOff,
        name: "Pump in cistern",
        topic: "outdoor/garden/main/switch/pump",
        ...pictures.water
    },            
    {
        ...deviceOnOff,
        name: "Light at stairs",
        topic: "outdoor/garden/main/switch/lightstairs",
        ...pictures.lightStairs
    },           
    {
        ...deviceOnOff,
        name: "Lights on stonefield",
        topic: "outdoor/garden/fs20/switch/light stonefield",
        ...pictures.lightStonefield
    },
    {
        ...deviceOnOff,
        name: "Lights on pathway",
        topic: "outdoor/garden/fs20/switch/light pathway",
        ...pictures.lightPathway
    }
    /*,    
    { 
        ...deviceOnOff,
        name: '',
        topic: '',
    }
    */
]