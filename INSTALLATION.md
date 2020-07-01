# Installation

This file describes how to install yaha on a Raspberry.pi

## Install raspberry pi

Yaha runs on any system supporting node.js (at least I think so). I recommend to use a raspberry pi with a "command-line-only" installation. Use ssh to access the raspberry. Additionally install

- npm (the nod package manager)
- pm2 (a multi-node.js tasks manager)
- A browser (example Apache)

## Install pm2

pm2 is not needed, but helps to monitor and run several node tasks. Yaha needs at least two node.js tasks to run, the broker and the services. Separating services in different node tasks is supported, but optional. The advantage of the separation is that single services still run, if one service has a problem.

```Script
sudo npm install pm2
```

## Use ssh to log into the raspberry pi

ssh pi@yahapi

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

```script
npm i @mangar2/servicecli
```

### Tell pm2 to run the messagestore service

please not the blank between the first -- and ./message_store_config.json. This blank is important. It tells pm2 to use the following parameters for node and not for pm2

```script
pm2 start /home/pi/yaha/services/node_modules/@mangar2/servicecli/servicecli.js -- /home/pi/yaha/services/message_store_config.json --env production
```

## Update rasberrian (more a note for myself ...)

### Update the operating system

sudo apt update

### Update the npm

sudo npm install -g npm
