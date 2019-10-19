# yaha - yet another home automation

UNDER CONSTRUCTION
only interessting for developers having interest in joining in an early state

## Target

I have build my own home automation and are sharing the code here piece by piece. It runs on linux and windows and focusses on automation. Thus it is not a "home remote control". In an effect input/output is a little behind, there is currently a rudementar web client but it is an expert client...

The home automation consists of the follwoing elmements

*node.js server
*Arduinos attached by RS485
*ESP8266 (and in future ESP32) attached by WLan
*FS20 remote controls
*ZWave (integrated via OpenZwave)

Nearly everything is programmed from the scratch.

## The Broker

The Broker is the first published microservice. It is the core of the home automation project. The current provided broker is tested, but not in "productive use" (I run a much older version).

The Broker is built according the mqtt principle. Please read the mqtt documentation to understand the principles. The current implementation is not fully supporting the mqtt standard - and will not unless somebody needs these features.

Supported:

* Quality of service 0, 1
* Connect, Disconnect
* Subscribe, Unsubscribe
* Publish
* Logging
* Retain Messages

Configuration options:

* inFlightWindow - Amount of QoS=1 messages send in the same time for one topic
* timeoutInMilliseconds - timeout in Milliseconds to wait for an answer of a http publish
* maxRetryCount - amount of retries to publish to a client before disconnecting it
* maxQueueSize - amount of QoS=1 messages in a queue for the same topic
* directory - directory to store the broker state
* fileName - name of the file to store the broker state (the system will add a timestamp and an extension to the filename )
* port - the port the broker will listen on
* log - logging settings. Supported logging modules "received" (for received messages) and "send" (for send messages)

Not Supported:

* Quality of service 2 (partially implemented using it will break the broker)
* Will messages
* Username/password
* https
* sending messages without network access (no reverse proxy functionality)
