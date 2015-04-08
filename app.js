express = require('express.io');
app = express().http().io();
var util = require('util'),
    redis = require('redis'),
    fs = require('fs'),
    myCredentials = require("./credentials.js");
    myRGB = '#00FFDD',
    myLed = 1,
    myLcd=1,
    myMotion = 0,
    myPot = 0,
    myPhoto = 0,
    myServo = 1,
    myPiezo = 0,
    myPush = 0,
    myPing = 0,
    myUpdatedTime = '12:00:00',
    myRGBOld = '#FF0000',
    myLedOld = 0,
    myServoOld = 0,
    myPiezoOld = 0,
    myLcdOld = 10;
var obj;


clientPub = redis.createClient(myCredentials.myPort, myCredentials.myDB),
clientPub.auth(myCredentials.myAuth, function() {
  console.log("Connected to Redis Pub Successfully!");
});

clientSub = redis.createClient(myCredentials.myPort, myCredentials.myDB);
clientSub.auth(myCredentials.myAuth, function() {
  console.log("Connected to Redis Sub Successfully!");
});

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

function writeToRedis() {
    if (myRGBOld != myRGB) {
        clientPub.publish("myRGB", myRGB);
        console.log("written to redis ledValues:" + myRGB);
    }

    if (myLedOld != myLed) {
        clientPub.publish("myLed:", myLed);
        console.log("written to redis ledValue:" + myLed);
    }

    if (myServoOld != myServo) {
        clientPub.publish("myServo", myServo);
        console.log("written to redis servoValue:" + myServo);
    }

    if (myPiezoOld != myPiezo) {
        clientPub.publish("myPiezo", myPiezo);
        console.log("written to redis piezoValue:" + myPiezo);
    }

    if (myLcdOld != myLcd) {
        clientPub.publish("myLcd", myLcd);
        console.log("written to redis Lcd:" + myLcd);
    }

    myRGBOld = myRGB;
    myLedOld = myLed;
    myServoOld = myServo;
    myPiezoOld = myPiezo;
    myLcdOld = myLcd;
}

app.io.route('changeMotor', function(req) {
  myServo = req.data.myVal;
  req.io.broadcast('displayNewMotor',myServo);
});

app.io.route('changeLEDValues', function(req) {
  myRGB = req.data.myVal;
  req.io.broadcast('displayNewLED',req.data.myVal);
});

app.io.route('playSong', function(req) {
  myPiezo = 1;
});

app.io.route('changeLEDStatus', function(req) {
  myLed = req.data.myVal;
  req.io.broadcast('displayNewLEDStatus',myLed);
});

app.io.route('getInitialValues', function(req) {  //this function only runs once
  req.io.emit('displayInitialValues', {
    photo: myPhoto,
    pot: myPot,
    ping: myPing,
    servo: myServo,
    push: myPush,
    ledvalues: myRGB,
    ledvalue: myLed,
    motion: myMotion
  });
});

app.io.route('getValues', function(req) {
  req.io.emit('displayReadOnlyData', {
    photo: myPhoto,
    pot: myPot,
    ping: myPing,
    push: myPush,
    motion: myMotion
  });
});

setInterval(function(){
     writeToRedis();
}, 1000);

app.get('/', function(req, res) {
  res.sendfile(__dirname + '/views/index.html');
});

app.use(express.static(process.cwd() + '/Public'));
console.log("connected");
app.listen(8081);
