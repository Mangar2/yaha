# yaha

yet another home automation

## Abstract

I have build my own home automation and are sharing the code here piece by piece. It runs on linux and windows and focusses on automation. Thus it is not a "home remote control". In an effect input/output is a little behind, there is currently a rudementar web client but it is an expert client...

The home automation consists of the follwoing elmements

*node.js server
*Arduinos attached by RS485
*ESP8266 (and in future ESP32) attached by WLan
*FS20 remote controls
*ZWave (integrated via OpenZwave)

Nearly everything is programmed from the scratch.

### The Broker

The controlling core is a "MQTT like" broker using HTTP instead of Websockets.
