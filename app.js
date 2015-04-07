express = require('express.io');
app = express().http().io();
var jf = require('jsonfile');
var util = require('util');
var fs = require('fs');
var obj;
var file = '../read.json';
var myLed = 0, myPot = 0, myPhoto = 0,myVals=0,myUpdatedTime='12:00:00';
var redis = require('redis');

clientPub = redis.createClient(9599, "greeneye.redistogo.com"),
clientSub = redis.createClient(9599, "greeneye.redistogo.com");

clientPub.auth("e63c9194c1a677e782cd17c88cf30d5f", function() {
  console.log("Connected to Redis Pub Successfully!");
});

clientSub.auth("e63c9194c1a677e782cd17c88cf30d5f", function() {
  console.log("Connected to Redis Sub Successfully!");
});

//client.publish("potValue", 4);
//client.publish("servoValue", 2);
//client.publish("pushValue", 1);
//client.publish("motionValue", 1);
//client.publish("pingValue", 1);
//client.publish("rgbValues", '#00FFDD');
//client.publish("piezoValue", 1);
//client.publish("ledValue", 1);
//client.publish("lcdValue", 10);

clientSub.subscribe("motionValue");
clientSub.subscribe("pushValue");
clientSub.subscribe("toggleValue");
clientSub.subscribe("photoValue"); 
clientSub.subscribe("potValue");

clientSub.on("message", function (channel, message) {
       if (channel == 'motionValue') {
            myMotion = message;
            console.log("motionValue received " + message);
        } else if (channel == 'pushValue') {
            myPush = message;
            console.log("pushValue received " + message);
        } else if (channel == 'toggleValue') {
            myToggle = message;
            console.log("toggleValue received " + message);
        } else if (channel == 'photoValue') {
            myPhoto = message;
            console.log("photoValue received " + message);
        } else if (channel == 'potValue') {
            myPot = message;
            console.log("potValue received " + message);
        }
    });

//clientPub.publish("ledValue", 1);


setInterval(function(){
  /* fs.readFile(file, 'utf8', function (err, data) {
    if (err) throw err;
    obj = JSON.parse(data);
    myLed = obj.led;
    myPot = obj.pot;
    myPhoto = obj.photo;
    myUpdatedTime = obj.updated;
    myVals = obj;
   // console.log(obj)
   });  */
}, 5000);

app.io.route('ready', function(req) {
  req.io.emit('talk', {
    message: myPhoto
  });
});

app.io.route('talking', function(req) {
  //console.log('should be talking');
  req.io.emit('displayVal', {
    message: myUpdatedTime
  });
});
// Send the client html.
app.get('/', function(req, res) {
res.sendfile(__dirname + '/views/index.html');
});




app.use(express.static(process.cwd() + '/Public'));
app.listen(8081);
