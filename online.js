//  Online webserver
//
//   ...hosted at localhost:8081 currently
//
//

express = require('express.io');
app = express().http().io();
var redis = require('redis'),
    myCredentials = require("./credentials.js"),
    myWeb = "<video src='http://somewebrtcstreamhere'></video>",
    myLed = 0,
    myLedOld = 0,
    myLcd=10,
    myLcdOld = 10,
    myMotion = 0,
    myMotionOld = 0,
    myServo = 1,
    myServoOld = 1,
    myText = "",
    myTextOld = "",
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
    myPing = 0,
    usersOnline = 0;

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
clientSub.subscribe("webcamValue");

clientSub.on("error", function(err) {
    console.error("Error connecting to redis subscribe", err);
});

clientPub.on("error", function(err) {
    console.error("Error connecting to redis publish", err);
});


clientSub.on("message", function (channel, message) {
    if (channel == 'motionValue') {
        myMotion = message;
        app.io.broadcast('displayMotionValue',myMotion);
    } else if (channel == 'pushValue') {
        myPush = message;
        app.io.broadcast('displayPushValue',myPush);
    } else if (channel == 'toggleValue') {
        myToggle = message;
        app.io.broadcast('displayToggleValue',myPush);
    } else if (channel == 'photoValue') {
        myPhoto = message;
        console.log("photo is " + myPhoto);
        app.io.broadcast('displayPhotoValue',myPhoto);
    } else if (channel == 'pingValue') {
        myPing = message;
        app.io.broadcast('displayPingValue',myPing);
    } else if (channel == 'webcamValue') {
         webcamLink = message;
         req.io.broadcast('newWebcamLink',myLink);
    } else if (channel == 'potValue') {
         myPot = message;
         app.io.broadcast('displayPotValue',myPot);
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
app.io.route('getInitialValues', function(req) {
    req.io.emit('displayInitialValues', {
        myPhoto: myPhoto,
        myPot: myPot,
        myPing: myPing,
        myServo: myServo,
        myPush: myPush,
        myRgb: myRGB,
        myLed: myLed,
        myMotion: myMotion,
        myFace: myFace,
        myText: myText
    });
    clientPub.publish("userConnected", 1);
    usersOnline++;
    console.log(usersOnline + " users online");
    clientPub.publish("faceValue", myFace);
});


app.io.route('servoValueChange', function(req) {
    myServo = req.data.myVal;
    req.io.broadcast('displayNewMotor',myServo);
});

app.io.route('textValueChange', function(req) {
    myText = req.data.myVal;
    req.io.broadcast('displayNewText',myText);
    clientPub.publish("textValue", myText);
});

 app.io.route('rgbValueChange', function(req) {
     myRGB = req.data.myVal;
     clientPub.publish("rgbValue", myRGB);
     req.io.broadcast('displayNewRGB',myRGB);
 });

app.io.route('piezoValueChange', function(req) {
    myPiezo = 1;
});

app.io.route('getName', function(req) {
    myName = req.data.myVal;
    clientPub.publish("nameValue", myName);
});

app.io.route('faceValueChange', function(req) {
    myFace = req.data.myVal;
    req.io.broadcast('displayNewFace',myFace);
    clientPub.publish("faceValue", myFace);
});

app.io.route('nameValueChange', function(req) {
    myName = req.data.myVal;
});

app.io.route('ledValueChange', function(req) {
    myLed = req.data.myVal;
    req.io.broadcast('displayNewLED',myLed);
});

app.io.route('getReadOnlyValues', function(req) {
    req.io.emit('displayReadOnlyValues', {
        myPhoto: myPhoto,
        myPot: myPot,
        myPing: myPing,
        myPush: myPush,
        myMotion: myMotion,
    });
});

app.io.route('disconnect', function(req) {
    usersOnline--;
    console.log(usersOnline + " users online");
    if (usersOnline === 0) {
        clientPub.publish("faceValue", 1);
    }
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

app.io.route('sendEmail', function(req) {
    senderName = req.data.senderName;
    senderEmail = req.data.senderEmail;
    senderPhone = req.data.senderPhone;
    senderMessage = req.data.senderMessage;
   // call php function
});
