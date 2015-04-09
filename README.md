# JohnnyRedis


My website (bradlannon.ca) is a combination of web technologies Node.js, Redis, HTML, and Bootstrap.  I'ved used the popular Johnny-Five (arduino-node.js library) and sync'ed it up with my Arduino MEGA. My Arduino has several digital and analog sensors/motors that you can control through the website.  There is a Redis database that allows me to publish and subscribe change events from my arduino or webpage.   Because I used socket.io realtime event library, you will notice that if you update it on one browser, it will update on all browsers, across the internet.

There are essentially 2 node.js servers:
1)  Home Server (home.js) - connected to my Arduino at my house with several sensors attached.
2)  AWS Server (online.js) - front end for controlling and viewing the data.


Redis is the middle man between the two node.js servers for communication because it has the power to connect two node.js servers together using publish and subscribe.  Once you, for example, turn on an LED from the webpage, socket.io will send a realtime message to online.js which will in turn send the value to Redis.  Because the home.js server is listing to that Redis server, it will hear that a value has changed and then update it on the arduino.  I configured it this way so that the web is not connected directly to the arduino in my house. That could be dangerous!

To start install node package manager (npm).

run npm install in command line

You may have to install some global node modules using -g.



To run online server:
gulp online

To run home server:
gulp home

