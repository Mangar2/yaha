import { pictures } from './pictures/pictures'

const deviceOnOff = {
    actions: ['on', 'off']
}

const light = {
    ...deviceOnOff,
    properties: ['control'],
    pictures: pictures.light
}

const measured =  {
    actions: [],
    properties: ['measured']
}

export const devices: any = [
    {
        ...deviceOnOff,
        name: 'Main status',
        topic: 'system/presence',
        value: 'on',
        actions: ['on', 'off', 'sleeping'],
        properties: ['favorit', 'control'],
        pictures: pictures.house
    },
    {
        ...deviceOnOff,
        name: 'Computer main power',
        topic: 'first/study/zwave/switch/master',
        properties: ['favorit', 'control'],
        value: 'on',
        pictures: pictures.powerSwitch
    },
    { 
        ...deviceOnOff,
        name: 'Backup computer',
        topic: 'ground/wardrobe/i2c/switch/backup',
        actions: ['on', 'hibernate', 'off'],
        properties: ['favorit', 'control'],
        pictures: pictures.backup
    },
    { 
        ...deviceOnOff,
        name: 'Charge',
        topic: 'ground/wardrobe/i2c/switch/charge',
        properties: ['control'],        
        pictures: pictures.charge
    },    
    { 
        ...deviceOnOff,
        name: 'Monitor',
        topic: 'ground/wardrobe/i2c/switch/monitor',
        properties: ['favorit', 'control'],
        pictures: pictures.monitor
    },    
    { 
        ...deviceOnOff,
        name: 'Floor heating',
        topic: 'ground/wardrobe/fs20/switch/floor heating',
        properties: ['control'],
        pictures: pictures.floorHeating
    },    
    { 
        ...deviceOnOff,
        name: 'Network switch',
        topic: 'ground/wardrobe/i2c/switch/network switch',
        properties: ['control'],
        pictures: pictures.networkSwitch
    },    
    { 
        ...deviceOnOff,
        name: 'Security camera',
        topic: 'ground/livingroom/zwave/switch/camera',
        properties: ['control'],
        pictures: pictures.securityCamera
    },    
    { 
        ...deviceOnOff,
        name: 'Electric iron',
        topic: 'first/dressingroom/zwave/switch/electric iron',
        properties: ['control'],
        pictures: pictures.electricIron
    },
    {
        ...deviceOnOff,
        name: "Battery charging",
        topic: "ground/livingroom/zwave/switch/charge",
        properties: ['control'],
        pictures: pictures.charge
    },
    {
        ...deviceOnOff,
        name: "Ceiling floodlight",
        topic: "ground/livingroom/zwave/switch/floodlight",
        properties: ['control'],
        pictures: pictures.light
    },
    {
        ...deviceOnOff,
        name: "Roller shutter south-east",
        topic: "ground/livingroom/zwave/shutter/southeast",
        actions: ['up', 'down', 'stop'],
        properties: ['control'],
        pictures: pictures.roller
    },
    {
        ...deviceOnOff,
        name: "Roller shutter south-west",
        topic: "ground/livingroom/zwave/shutter/southwest",
        actions: ['on', 'off', 'stop'],
        properties: ['control'],
        pictures: pictures.roller
    },
    {
        ...deviceOnOff,
        name: "Master switch multimedia",
        topic: "ground/livingroom/zwave/switch/tvmaster",
        properties: ['control'],
        pictures: pictures.multimedia
    },
    {
        ...deviceOnOff,
        name: "Multimedia amplifier",
        topic: "ground/livingroom/fs20/switch/amplifier",
        properties: ['control'],
        pictures: pictures.amplifier
    },
    {
        ...deviceOnOff,
        name: "Apple TV",
        topic: "ground/livingroom/fs20/switch/appletv",
        properties: ['control'],
        pictures: pictures.computer
    },
    {
        ...deviceOnOff,
        name: "Dishwasher",
        topic: "ground/kitchen/zwave/switch/dishwasher",
        properties: ['control'],
        pictures: pictures.dishwasher
    },
    {
        ...deviceOnOff,
        name: "Refrigerator",
        topic: "ground/kitchen/zwave/switch/fridge",
        properties: ['control', 'protect'],
        pictures: pictures.refrigerator
    },
    {
        ...deviceOnOff,
        name: "Ventilation system",
        topic: "ground/wardrobe/zwave/switch/ventilation",
        properties: ['control'],
        pictures: pictures.ventilationSystem
    },
    {
        ...deviceOnOff,
        name: "Smarthome Power",
        topic: "ground/wardrobe/zwave/switch/smarthome",
        properties: ['control', 'protect'],
        pictures: pictures.powerSwitch
    },
    {
        ...deviceOnOff,
        name: "Smarthome server",
        topic: "ground/wardrobe/i2c/switch/server",
        actions: ['shutdown', 'on', 'off'],
        properties: ['control', 'protect'],
        pictures: pictures.smarthomeServer
    },
    {
        ...deviceOnOff,
        name: "Internet router (fritz box)",
        topic: "ground/wardrobe/i2c/switch/internet",
        properties: ['control', 'protect'],
        pictures: pictures.internet
    },
    {
        ...deviceOnOff,
        name: "Socket at parkingplace",
        topic: "outdoor/garden/main/switch/socketparkingplace",
        properties: ['control', 'notify'],
        pictures: pictures.socket
    },   
    {
        ...deviceOnOff,
        name: "Socket at stonefield",
        topic: "outdoor/garden/main/switch/socketstonefield",
        properties: ['control'],
        pictures: pictures.socket
    },   
    {
        ...deviceOnOff,
        name: "Pump in cistern",
        topic: "outdoor/garden/main/switch/pump",
        properties: ['control', 'notify'],
        pictures: pictures.water
    },            
    {
        ...deviceOnOff,
        name: "Light at stairs",
        topic: "outdoor/garden/main/switch/lightstairs",
        properties: ['control'],
        pictures: pictures.lightStairs
    },           
    {
        ...deviceOnOff,
        name: "Lights on stonefield",
        topic: "outdoor/garden/fs20/switch/light stonefield",
        properties: ['control'],
        pictures: pictures.lightStonefield
    },
    {
        ...deviceOnOff,
        name: "Lights on pathway",
        topic: "outdoor/garden/fs20/switch/light pathway",
        pictures: pictures.lightPathway
    },
    {
        ...deviceOnOff,
        name: "Laser printer",
        topic: "first/study/zwave/switch/laserprinter",
        properties: ['control'],
        pictures: pictures.printer
    },
    {
        ...deviceOnOff,
        name: "Regina's computer",
        topic: "first/study/zwave/switch/pcregina",
        properties: ['control'],
        pictures: pictures.computerTower
    },
    {
        ...deviceOnOff,
        name: "Volker's computer",
        topic: "first/study/zwave/switch/pcvolker",
        properties: ['control'],
        pictures: pictures.computerTower
    },
    {
        ...deviceOnOff,
        name: "Camera boilerroom",
        topic: "cellar/boilerroom/switches/switch/camera",
        properties: ['control'],
        pictures: pictures.securityCamera
    },
    {
        ...light,
        name: "light study",
        topic: "first/study/main/light/light on time",
    },
    {
        ...light,
        name: "light dressing room",
        topic: "first/dressingroom/main/light/light on time",
    },
    {
        ...light,
        name: "light bathroom",
        topic: "first/bathroom/main/light/light on time",
    },
    {
        ...light,
        name: "light hallway",
        topic: "first/hallway/main/light/light on time",
    },
    {
        ...light,
        name: "light hallway",
        topic: "cellar/hallway/main/light/light on time",
    },
    {
        ...light,
        name: "light storeroom",
        topic: "cellar/storeroom/main/light/light on time",
    },
    {
        ...light,
        name: "light boilerroom",
        topic: "cellar/boilerroom/main/light/light on time",
    },
    {
        ...light,
        name: "light hobbycellar west",
        topic: "cellar/hobbycellar/west/light/light on time",
    },
    {
        ...light,
        name: "light hobbycellar east",
        topic: "cellar/hobbycellar/east/light/light on time",
    },
    {
        ...light,
        name: "light hobbycellar north",
        topic: "cellar/hobbycellar/north/light/light on time",
    },
    {
        ...measured,
        name: "temperature [2]",
        topic: "%/%/%/temperature and humidity sensor/temperature in celsius",
        pictures: pictures.temperature
    },
    {
        ...measured,
        name: "outside temperature",
        topic: "outdoor/garden/main/weather/temperature",
        properties: ['measured', 'favorit'],
        pictures: pictures.temperature
    },
    {
        ...measured,
        name: "outside pressure",
        topic: "outdoor/garden/main/weather/pressure",
        pictures: pictures.pressure
    },
    {
        ...measured,
        name: "outside humidity",
        topic: "outdoor/garden/main/weather/humidity",
        pictures: pictures.humidity
    },
    {
        ...measured,
        name: "power consumption",
        topic: "solar/consumption",
        properties: ['measured', 'favorit'],
        pictures: pictures.consumption
    },
    {
        ...measured,
        name: "solar power feed in",
        topic: "solar/feedin",
        properties: ['measured', 'favorit'],
        pictures: pictures.feedin
    },
    {
        ...measured,
        name: "solar power yield",
        topic: "solar/solar yield",
        properties: ['measured', 'favorit'],
        pictures: pictures.solaryield
    }
    /*,    
    { 
        ...deviceOnOff,
        name: '',
        topic: '',
    }
    */
]