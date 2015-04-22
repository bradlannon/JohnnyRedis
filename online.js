//  Online webserver
//
//   ...hosted at localhost:8081 currently
//
//

express = require('express.io');
app = express().http().io();
var redis = require('redis'),
    myCredentials = require("./credentials.js"),
    myLed = 0,
    myLedOld = 0,
    myLcd=10,
    myLcdOld = 10,
    myMotion = 0,
    myMotionOld = 0,
    myServo = 1,
    myServoOld = 1,
    myText = "text",
    myTextOld = "text",
    myFace = 10,
    myFaceOld = 10,
    myName = "brad",
    myNameOld = "brad",
    myPiezo = 0,
    myPiezoOld = 0,
    myRGBOld = '#FF0000',
    myRGB = '#FF0000',
    myPush = 0,
    myPhoto = 0,
    myPot = 0,
    myPing = 0;

clientPub = redis.createClient(myCredentials.myPort, myCredentials.myDB);
clientPub.auth(myCredentials.myAuth);
clientSub = redis.createClient(myCredentials.myPort, myCredentials.myDB);
clientSub.auth(myCredentials.myAuth, function() {
  console.log("Connected successfully to Redis");
});

clientSub.subscribe("motionValue");
clientSub.subscribe("pushValue");
clientSub.subscribe("toggleValue");
clientSub.subscribe("photoValue");
clientSub.subscribe("potValue");
clientSub.subscribe("pingValue");

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
} else if (channel == 'pingValue') {
        myPing = message;
        console.log("pingValue received " + message);
    } else if (channel == 'potValue') {
        myPot = message;
        console.log("potValue received " + message);
    }
});

function writeToRedis() {
    if (myRGBOld != myRGB) {
        clientPub.publish("rgbValue", myRGB);
        console.log("written to redis rgbValue:" + myRGB);
    }

    if (myLedOld != myLed) {
        clientPub.publish("ledValue", myLed);
        console.log("written to redis ledValue:" + myLed);
    }

    if (myServoOld != myServo) {
        clientPub.publish("servoValue", myServo);
        console.log("written to redis servoValue:" + myServo);
    }

    if (myPiezoOld != myPiezo) {
        clientPub.publish("piezoValue", myPiezo);
        console.log("written to redis piezoValue:" + myPiezo);
    }

    if (myTextOld != myText) {
        clientPub.publish("textValue", myText);
        console.log("written to redis textValue:" + myText);
    }

    if (myFaceOld != myFace) {
        clientPub.publish("faceValue", myFace);
        console.log("written to redis faceValue:" + myFace);
    }

    if (myNameOld != myName) {
        clientPub.publish("nameValue", myName);
        console.log("written to redis nameValue:" + myName);
    }
    myNameOld = myName;
    myFaceOld = myFace;
    myRGBOld = myRGB;
    myLedOld = myLed;
    myServoOld = myServo;
    myPiezoOld = myPiezo;
    myTextOld = myText;
}


// Socket.io  sending and receiving from website

app.io.route('servoValueChange', function(req) {
    myServo = req.data.myVal;
    req.io.broadcast('displayNewMotor',myServo);                   // good
});

app.io.route('textValueChange', function(req) {
    myText = req.data.myVal;
    req.io.broadcast('displayNewText',myText);                      // good
    clientPub.publish("textValue", myText);          
});

app.io.route('rgbValueChange', function(req) {
    myRGB = req.data.myVal;                                         // good
    req.io.broadcast('displayNewRGB',req.data.myVal);
});

app.io.route('piezoValueChange', function(req) {
    myPiezo = 1;                                                   // good
});

app.io.route('getName', function(req) {
    myName = req.data.myVal;
    ipaddress = "ip"
    clientPub.publish("nameValue", myName + "-ip:" + ipaddress);
});

app.io.route('faceValueChanged', function(req) {
    myFace = req.data.myVal;
    req.io.broadcast('displayNewFace',myFace);                   // good
    clientPub.publish("faceValue", myFace);
});

app.io.route('nameValueChanged', function(req) {
    myName = req.data.myVal;
});

app.io.route('ledValueChange', function(req) {
    myLed = req.data.myVal;                                          //   good
    req.io.broadcast('displayNewLEDStatus',myLed);
});

app.io.route('getInitialValues', function(req) {  
    req.io.emit('displayInitialValues', {
        photo: myPhoto,
        pot: myPot,
        ping: myPing,
        servo: myServo,
        push: myPush,                                        // good
        rgb: myRGB,
        led: myLed,
        motion: myMotion,
        face: myFace,
        mytext: myText
    });
});

app.io.route('getReadOnlyValues', function(req) {
    req.io.emit('displayReadOnlyValues', {
        photo: myPhoto,
        pot: myPot,                                         // good
        ping: myPing,
        push: myPush,
        motion: myMotion,
    });
});

setInterval(function(){
    writeToRedis();
}, 1000);

app.get('/', function(req, res) {
    res.sendfile(__dirname + '/views/index.html');
});

app.use(express.static(process.cwd() + '/Public'));
    console.log("Visit to localhost:8081 in your browser");
app.listen(8081);
