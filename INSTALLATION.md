# Installation

This file describes how to install yaha on a linux system

## Headless installation of a raspberry pi (Optional)

Yaha runs on any modern os supporting node.js like linux, windows or mac. A raspberry pi is a good choice to run it - I tested it on a Rasberry Pi 3, zero and zero 2. This chapter descripes how to set up a headless raspberry pi (whithout attaching mouse, keyboard or screen). 

This chapter describes a headless installation of the operating system.

### Install a headless raspberry Pi OS using Raspberry Pi Imager

This chapter describes how to install raspberry pi lite - without graphical user interface. We will use the system in headless mode only via. command line using ssh later. This is sufficient for yaha home automation. 

- 
- The raspberry Pi Imager can be found on raspberrypi.com - download and install it for your operation system.
- Run the Pi Imager and choose Raspberry Pi OS Lite (32-Bit) for installation (press the write button)
- DO NOT format the disk (when Windows is asking you to do so)

### Activate OpenSSH

Create an empty file called "ssh" in the boot partition. The file will be deleted automatically on startup.

### Install WLAN

Create a file named wpa_supplicant.conf on the same boot partition with the following content (replace the WLAN SSID and the WLAN PASSWORD with your WLAN SSID/Password)

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

### Boot the system

Remove the sd card, insert it in your raspberry and switch power on - and wait a minute for the system to boot. 

### Use ssh to log into the raspberry pi

```Script
ssh -l pi pi@raspberrypi
```

Note the raspberry default passwort ist raspberry

If you get an error message WARNING: REMOTE HOST IDENTIFICATION HAS CHANGED, then you might have just installed a second raspberry and the windows system is now complaining, that new new raspberry has different keys. Then delete the raspberry entry from the file C:\\Users\\Mangar/.ssh/known_hosts and try again!

Note: files can be copied with scp (secure copy based on ssh). Example (copies a full directory recursively to a target):

```script
scp -r ./* pi@raspberrypi:/home/pi/yaha/services/*
```

### Change password

Once logged on, change your password with

```Script
sudo passwd pi
```

### update the os

upate the os from time to time use apt full-upgrade to upgrade all packages - do this right after installation

```Script
sudo apt update # download updates for the new version
sudo apt full-upgrade # Riski version to perform the update, removing installed packages if needed
```

If the system is running for a while you might choose to do a more safe version of the upgrade only:

```Script
sudo apt update # download updates for the new version
sudo apt upgrade # Safe version to perform the update, not removing installed packages if needed
```

### Change the raspberries configuration - hostname, timezone, ... (optional)

Run raspi-config to change the raspberry´s configuration

```Script
sudo raspi-config
```

- Change the Hostname (in Menu 1. System Options) - recommended
- Change the timezone (5. Localisation Options)

### Set a static IP-Address (optional)

The default configuration uses dhcp. If you prefere static ip adresses, you might choose to configure a static ip-address

```Script
hostname -I #prints the current IP-address
sudo nano /etc/dhcpcd.conf #To edit the configuration file
```
Remove the comment from the ip-address entries and change the addresses accordingly.

## Install needed software on your system (mandatory)

Yaha requires the following software to be installed on your system

- npm
- node 
- pm2 (a multi-node.js tasks manager)
- apache web-server (or equivalent)

### Install npm, node on linux

- 1. Update all packages
- 2. Install node and npm by apt-get 
- 3. Install "n" the node installation utility
- 4. Install an actualized version of node (use 14.18.2, as openzwave-shared does not yet support node v. 16 or higher)

```Script
sudo apt-get update
sudo apt-get install npm
sudo npm install -g n
sudo n 14.18.2
node -v
npm -v
```

#### Alternative manual installation 

Check the version you need by calling uname and checking online which version is actual. "uname" retrieves the processor architecture (example armV61 raspberry zero W and armV71 for raspberry 3B).

```Script
uname -m
```

Replace the link below with the most actual link and directory name for your ARM version. Hint: the latest armv61 version is https://nodejs.org/dist/v11.15.0/node-v11.15.0-linux-armv6l.tar.gz

```Script
wget https://nodejs.org/dist/v15.14.0/node-v15.14.0-linux-armv7l.tar.xz
tar -xf node-v15.14.0-linux-armv7l.tar.xz
cd node-v15.14.0-linux-armv7l
sudo cp -R * /usr/local/

#test
node -v
npm -v
```

### Install remaining tools

- node-gyp is needed to install native node packages
- pm2 is a manager for node tasks we use it in yaha - it is helpful, but not required. 
- Apache is a web-server required to provide a web-frontend
- Git is a source code management software - not required but helpful, if you like to code yourself
- apt autoremove deletes no longer used packages

```Script
sudo npm install -g node-gyp
sudo npm install -g pm2
sudo pm2 startup
sudo env PATH=$PATH:/usr/local/bin /usr/local/lib/node_modules/pm2/bin/pm2 startup systemd -u pi --hp /home/pi
sudo apt-get install apache2
sudo apt autoremove
```

## Install yaha

### create directory structure

```Script
mkdir yaha
cd yaha
mkdir data # to store state files of services
```

### installing open zwave (optional)

Optional installation. Install open zwave only, if you have zwave devices (and a zwave USB stick or similar). 

```Script
cd \home\pi\yaha
wget http://old.openzwave.com/downloads/openzwave-1.6.1914.tar.gz
tar -xvzf openzwave-1.6.1914.tar.gz
cd openzwave-1.6.1914
make
sudo make install
sudo ldconfig
cd ..
rm openzwave-1.6.1914.tar.gz
```

### install the packages

```Script
cd \home\pi\yaha
npm i @mangar2/brokercli
npm i @mangar2/servicecli
npm i @mangar2/serialdevice
npm i @mangar2/rs485interface
npm i @mangar2/automation
npm i @mangar2/pushover
npm i @mangar2/opensensemap
npm i @mangar2/sunnyportal
npm i @mangar2/messagestore
npm i @mangar2/remoteservice
npm i @mangar2/zwave # only, if you use zwave - and installed openzwave before
```

### run the services

The services will be started with pm2 - a runtime manager to control different node packages. It is possible to run all parts of yaha in just one node task, but you are more flexible if you have several services

We will start 4 service packages that you can control by their configuration files

1. the "mqtt-style" broker
2. the message history store
3. Services running intern
4. Services running extern (connecting to remote services)
5. Save the new cofiguration

```Script
pm2 start /home/pi/node_modules/@mangar2/brokercli/brokercli.js --name broker --max-memory-restart 100M -- /home/pi/yaha/broker_config.json --env production
pm2 start /home/pi/node_modules/@mangar2/servicecli/servicecli.js --name messages --max-memory-restart 200M -- /home/pi/yaha/message_store_config.json --env production
pm2 start /home/pi/node_modules/@mangar2/servicecli/servicecli.js --name external --max-memory-restart 100M -- /home/pi/yaha/external_config.json --env production
pm2 start /home/pi/node_modules/@mangar2/servicecli/servicecli.js --name internal --max-memory-restart 100M -- /home/pi/yaha/services_config.json --env production
pm2 save
```

### test restarting pm 

```script
pm2 kill
pm2 resurrect
```


## Update the yaha installation

From time to time, you should update your installation to up-to-date versions. But please be careful updating node, as it requires recompiling the native node packages - especially serial and openzwave_shared. Both might not be compatible with the new node version. Thus I recommend to bakcup the services folder before any update.

### Update the operating system

```Script
sudo apt update
sudo apt full-upgrade
```

### update node/npm 

Only update, if the newer version fits together with the node version. The best version for raspberry zero (armV61 architecture) is 6.7.0.

```Script
sudo n [version] # sudo npm install -g npm@6.7.0 - for armV61
```



```Script
lsusb # lists all usb devices 
usb-devices # list details for usb devices
ls /dev/ttyACM*
```

## install code (optional)

If you like to develop for yaha, you might download the code from github

```script
mkdir source
cd source
git clone https://github.com/Mangar2/yaha
# get new version
git pull
```


## Other installation options (advanced user only)


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



## Apache

### Web page root directory

The root directory to place web pages in in /var/www

```Script
cd /var/www/html
mkdir yaha
cd yaha
```

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

Create a ssh tunnel (on the computer with the debugging interface):
ssh -L 9221:localhost:9229 pi@rapberrypi

In Chrome enter: 
chrome://inspect

