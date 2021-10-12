# Installation

This file describes how to install yaha on a Raspberry.pi

## Install raspberry pi

Yaha runs on any system supporting node.js (at least I think so). I recommend to use a raspberry pi with a "command-line-only" installation. Use ssh to access the raspberry. Additionally install

- npm (the nod package manager)
- pm2 (a multi-node.js tasks manager)
- A browser (example Apache)

### Install the OS

Install the raspberry pi OS (lite) without desktop.

### Activate OpenSSH

Create an empty file called "ssh" in the boot partition. The file will be deleted automatically on startup.

### Install WLAN

Create a file named wpa_supplicant.conf on the same boot partition with the following content:

```Script
country=DE
ctrl_interface=DIR=/var/run/wpa_supplicant GROUP=netdev
update_config=1
network={
     ssid="WLAN SSID"
     scan_ssid=1
     psk="WLAN PASSWORT"
     key_mgmt=WPA-PSK
}
```

Replace WLAN SSID and WLAN PASSWORD with your configuration. If you use VSCode choose "LF" (click on the CRLF in the footer line to change the line end to Linux format)

### Change password

Once logged on, change your password with

```Script
sudo passwd pi
```

### install npm

Check the version you need by calling uname and checking online which version is actual.

```Script
uname -m
```

Get the latest armv61 version by:

```Script
wget https://nodejs.org/dist/v11.15.0/node-v11.15.0-linux-armv6l.tar.gz
tar -xzf node-v11.15.0-linux-armv6l.tar.gz
cd node-v11.15.0-linux-armv6l
sudo cp -R * /usr/local/

#test
node -v
npm -v
```

## Install pm2

pm2 is not needed, but helps to monitor and run several node tasks. Yaha needs at least two node.js tasks to run, the broker and the services. Separating services in different node tasks is supported, but optional. The advantage of the separation is that single services still run, if one service has a problem.

```Script
sudo npm install pm2 -g
sudo pm2 startup
```

## Install Apache

Update the raspberry pi

```Script
sudo apt-get update
```

Install apache. (Web content path is '/var/www')

```Script
sudo apt-get install apache2
```

## Install open zwave

### Ensure the right timezone

```Script
sudo raspi-config
```

using »5 Internationalisation Options | 2 Change Timezone«

### installing open zwave

Go to the yaha directory

```Script
mkdir zwave
cd zwave
wget http://old.openzwave.com/snapshots/openzwave-1.6.10.tar.gz
tar -xvzf openzwave-1.6.10.tar.gz
cd openzwave-1.6.10
make
sudo make install
sudo ldconfig
rm openzwave-1.6.10.tar.gz
```

### Install openzwave-shared

```Script
npm install openzwave-shared
```

List usb devices

```Script
ls /dev/ttyACM*
```

## Use ssh to log into the raspberry pi

ssh pi@yahapi

## Recommended directory tree

- ./home/yaha
- ./home/yaha/broker    # contains the broker software
- ./home/yaha/data      # contains data stored by services
- ./home/yaha/services  # contains the services software including the configuration files

## Install broker

### Install the mqtt-style broker

```script
npm i @mangar2/brokercli
```

### Add brokercli to the ecosystem.config.js file of pm2

If you use pm2. Else start the brokercli directly

```JavaScript
  apps : [{
    name: 'broker',
    script: '/home/pi/yaha/broker/node_modules/@mangar2/brokercli/brokercli.js',
    args: '',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '100M',
    env: {
      NODE_ENV: 'production'
    },
    env_production: {
      NODE_ENV: 'production'
    }
  }
```

### Tell pm2 to run the broker

```script
pm2 start /home/pi/yaha/broker/node_modules/@mangar2/brokercli/brokercli.js -- --env production
```

### Run the broker, if not using pm2

```script
node ./node_modules/@mangar2/brokercli/brokercli
```

### Restart pm2 to test it

```script
pm2 kill
pm2 start
```

## Install runservices

Install the services in your services directory. We use /home/pi/yaha/services here. Feel free to select a different directory

```script
mkdir /home/pi/yaha/services
cd /home/pi/yaha/services
npm i @mangar2/servicecli
```

### Create a messagestore configuration file

Create the file "message_store_config.json" with the following content. It contains the settings for the messageStore only.

- The service listens on port 8200
- Has the name "yaha/messagestore"
- Requests the broker to queue messages if needed (clean = false)
- Persists the data in the folder /home/pi/yaha/data

```JSON
{
    "production": {
        "runservices": {
            "listener": 8200,
            "clientId": "yaha/messagestore",
            "clean": false,
            "services": [
                "messageStore"
            ]
        },
        "messageStore": {
            "persist" : {
                "directory": "/home/pi/yaha/data"
            }
        }
    }
}
```

### Tell pm2 to run the messagestore service

please not the blank between the first -- and ./message_store_config.json. This blank is important. It tells pm2 to use the following parameters for node and not for pm2

```script
pm2 start /home/pi/yaha/services/node_modules/@mangar2/servicecli/servicecli.js --name message -- /home/pi/yaha/services/message_store_config.json --env production
```

## Install other services

You may install the servicescli multiple times to update only some services. Here we use one code for all services.

### Create a services_config.json configuration file

### Tell pm2 to run the services

```script
pm2 start /home/pi/yaha/services/node_modules/@mangar2/servicecli/servicecli.js --name services -- /home/pi/yaha/services/services_config.json --env production
```

## Install the automation service

The automation service may be part of the services. I recommend to run it separately, because automation rule updates needs a restart of the service (change it is on the to do list, but not with priority).

### Create a automation_config.json configuraiton file

Example for a configuration file for automation

```JSON
{
    "production": {
        "runservices": {
            "listener": 8202,
            "clientId": "yaha/automation",
            "clean": false,
            "services": [
                "automation"
            ]
        },
        "automation": {
            "longitude": 3.14,
            "latitude": 1.414,
            "rules": [
                "/home/pi/yaha/services/motionrules.json",
                "/home/pi/yaha/services/automationrules.json",
                "/home/pi/yaha/services/alertrules.json"
            ],
            "intervalInSeconds": 60
        }
    }
}
```

### Tell pm2 to run the service

```script
pm2 start /home/pi/yaha/services/node_modules/@mangar2/servicecli/servicecli.js --name automation -- /home/pi/yaha/services/automation_config.json --env production
```

## Update rasberrian (more a note for myself ...)

### Login from powershell 

Select username with -l (raspberry default user name is pi, default password is raspberry)

```Script
ssh -l pi <destination>
```

## Update rasberrian (more a note for myself ...)

### Update the operating system

```Script
sudo apt update
sudo apt full-upgrade
```

### Update the npm

```Script
sudo npm install -g npm
```

## Apache

### Apache Webserver stoppen

```Script
sudo /etc/init.d/apache2 stop
```

### Apache Webserver starten

```Script
sudo /etc/init.d/apache2 start
```

### Stop Apache Webserver with restart

```Script
sudo /etc/init.d/apache2 restart
```
