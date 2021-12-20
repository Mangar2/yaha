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

### Use ssh to log into the raspberry pi

```Script
ssh -l pi pi@raspberrypi
```

Note the raspberry default passwort ist raspberry

### Set IP-Addresses

The default configuration uses dhcp. To configure a static ip-address do the following

```Script
hostname -I #prints the current IP-address
sudo nano /etc/dhcpcd.conf #To edit the configuration file
```

Remove the comment from the ip-address entries and change the addresses accordingly.

### Change password

Once logged on, change your password with

```Script
sudo passwd pi
```

### update the os

upate the os from time to time use apt full-upgrade to upgrade all packages

```Script
sudo apt update # download updates for the new version
sudo apt upgrade # Save version to perform the update, not removing installed packages if needed
sudo apt full-upgrade # Riski version to perform the update, removing installed packages if needed
```

### update npm 

Only update, if the newer version fits together with the node version. The best version for raspberry zero (armV61 architecture) is 6.7.0.

```Script
sudo npm install -g npm@latest
sudo npm install -g npm@6.7.0 # for armV61
```

### install npm and node

Check the version you need by calling uname and checking online which version is actual. "uname" retrieves the processor architecture (example armV61 raspberry zero W and armV71 for raspberry 3B).

```Script
uname -m
```

Get the latest armv61 version (For Raspi 3 or older) by:

```Script
wget https://nodejs.org/dist/v11.15.0/node-v11.15.0-linux-armv6l.tar.gz
tar -xzf node-v11.15.0-linux-armv6l.tar.gz
cd node-v11.15.0-linux-armv6l
sudo cp -R * /usr/local/

#test
node -v
npm -v
```

### Install node-gyp

Node-gyp is a tool stack to compile native node modules

```Script
sudo npm install -g node-gyp
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

## Install git

Installation of git is optional, use it only for development purpouses

```Script
sudo apt install git
```

## Install open zwave

### Ensure the right timezone

```Script
sudo raspi-config
```

using »5 Internationalisation Options | 2 Change Timezone«

### installing open zwave

Optional installation. Install open zwave only, if you have zwave devices (and a zwave USB stick or similar). 

From your "yaha" directory: 

```Script
mkdir service
cd service
wget http://old.openzwave.com/snapshots/openzwave-1.6.10.tar.gz
tar -xvzf openzwave-1.6.10.tar.gz
cd openzwave-1.6.10
make
sudo make install
sudo ldconfig
rm openzwave-1.6.10.tar.gz
cd ..
```

### Install openzwave-shared

Optional installation Install openzwave-shared only, if you have zwave devices and openzwave is already installed

From your "service" directory

create a package.json

```Script
npm install openzwave-shared
```

List usb devices (to see, which device to configure)

```Script
lsusb # lists all usb devices 
usb-devices # list details for usb devices
ls /dev/ttyACM*
```

## install code

Optional installation, only for developers with the aim to develop on yaha. From the directory "yaha"

```script
mkdir source
cd source
git clone https://github.com/Mangar2/yaha
# get new version
git pull
```

## Recommended directory tree

- ./home/yaha
- ./home/yaha/broker    # contains the broker software
- ./home/yaha/data      # contains data stored by services
- ./home/yaha/services  # contains the services software including the configuration files

## copy files

Files can be copied with scp (secure copy based on ssh). Example (copies a full directory recursively to a target):

```script
scp -r ./* pi@raspberrypi:/home/pi/yaha/services/*
```

## Install broker

### Install the mqtt-style broker

```script
npm i @mangar2/brokercli
```

or (if you downloaded all sources from github)

```script
npm i /home/pi/yaha/source/yaha/brokercli
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
pm2 start /home/pi/yaha/broker/node_modules/@mangar2/brokercli/brokercli.js -- /home/pi/yaha/broker/broker_config.json --env production
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

or (if you downloaded all sources from github)

```script
npm i /home/pi/yaha/source/yaha/servicecli
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
#optional services to add
pm2 start /home/pi/yaha/services/node_modules/@mangar2/servicecli/servicecli.js --name external -- /home/pi/yaha/services/external_config.json --env production
pm2 start /home/pi/yaha/services/node_modules/@mangar2/servicecli/servicecli.js --name arduino -- /home/pi/yaha/services/arduino_config.json --env production
pm2 start /home/pi/yaha/zwave/node_modules/@mangar2/servicecli/servicecli.js --name zwave -- /home/pi/yaha/zwave/yahaconfig.json --env production
#Save all changes
pm2 save
```

## Install serial services

### Create a symlink for the serial device

Linux will not assign the same serial device name after boot (for serial usb adapters ttyUSB0, ttyUSB1). Use symlinks to fix this:

```script
lsusb # find the usb devices
usb-devices # list details for usb devices
sudo nano /etc/udev/rules.d/99-usb-serial.rules

# file content (find vendor id with lsusb)
# SUBSYSTEM=="tty", ATTRS{idVendor}=="1a86", SYMLINK+="rs485"
# SUBSYSTEM=="tty", ATTRS{idVendor}=="2341", SYMLINK+="arduino"
# SUBSYSTEM=="tty", ATTRS{idVendor}=="0658", SYMLINK+="zwave"

# Apply changes
sudo udevadm control --reload-rules && sudo udevadm trigger

# Now use /dev/rs485 and /dev/arduino as the serial device
# See devices 
ls /dev/*
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

## Remote debugging

To remotely debug a node.js process running on a headless raspi

1: start the node task with --inspect

```Script
node --inspect /home/pi/yaha/services/node_modules/@mangar2/servicecli/servicecli.js /home/pi/yaha/services/arduino_config.json --env production
```

Now copy the link from the node response (example:)
ws://127.0.0.1:9229/ce7a4dd6-84cf-48d0-a5c2-b5859abfe335

Create a ssh tunnel:
ssh -L 9221:localhost:9229 pi@rapberrypi
