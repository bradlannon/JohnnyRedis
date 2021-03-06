# JohnnyRedis
### (Johnny-Five library + Redis)

My website (bradlannon.ca) is a combination of web technologies Node.js, Redis, HTML, and Bootstrap.  I'ved used the popular Johnny-Five (arduino-node.js library) and sync'ed it up with my 3 Arduinos which has several digital and analog sensors/motors that you can control through the website.  There is a Redis database that allows me to publish and subscribe change events from my arduino or webpage.   Because I used socket.io realtime event library, you will notice that if you update it on one browser, it will update on all browsers, across the internet.

There are essentially 2 node.js servers:
* 1)  Home Server (home.js) - connected to my Arduino at my house with several sensors attached.
* 2)  AWS Server (online.js) - front end for controlling and viewing the data.


Redis is the middle man between the two node.js servers for communication because it has the power to connect two node.js servers together using publish and subscribe.  Once you, for example, turn on an LED from the webpage, socket.io will send a realtime message to online.js which will in turn send the value to Redis.  Because the home.js server is listing to that Redis server, it will hear that a value has changed and then update it on the arduino.  I configured it this way so that the web is not connected directly to the arduino in my house. That could be dangerous!



#### To start, first install the node package manager (npm).


##### In terminal or command line run:
* npm install

##### You may have to install some global node modules using:
* npm install (module name) -g.

##### To run online server:
* gulp online

##### To run home server:
* gulp home

##### Get camera  WebRTC stream from:

* http://simpl.info/getusermedia/


**You also have to have a redis account.**
[Visit redistogo](http://redistogo.com/)  for a free account and don't forget to add the database information in credential.js. **


##### ARDUINO MEGA PINS:
* Photoresistor (A0) works
* RGB (2,3,4) works but add lower resistor on red
* Piezo (7) works but crackily
* LED1 (23) works
* LED2 (22) works
* LED3 (24) works
* Button (25) works

##### ARDUINO LEO PINS:
* LCD Screen

##### ARDUINO Dec. PINS:
* RGB (9,10,11) works but add lower resistor on red

