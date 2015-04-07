# JohnnyRedis
This is a Johnny-Five (arduino-node.js library) and a Redis website that allows other to securely(?) view sensors/control motors, leds, and other things from the web.

There is essentially a arduino connected node.js server at home, and then a node.js server in the cloud and redis is the middle man between the two for communication.   Redis Sub/Pub has the power to connect two node.js servers together. 
