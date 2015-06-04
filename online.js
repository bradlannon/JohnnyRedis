//  Online webserver
//
//   ...locally hosted at localhost:8080
//   ...online site: bradlannon.ca
//

express = require('express.io');
app = express().http().io();
var redis = require('redis'),
    myCredentials = require("./Public/js/credentials.js"),
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
    myPiezo = 0,
    myPiezoOld = 0,
    myRGBOld = '#FF0000',
    myRGB = '#FF0000',
    myPush = 0,
    myPhoto = 0,
    myPot = 0,
    myPing = 0,
    currentTime = '12:00',
    usersOnline = 0;

clientPub = redis.createClient(myCredentials.myPort, myCredentials.myDB);
clientPub.auth(myCredentials.myAuth);
clientSub = redis.createClient(myCredentials.myPort, myCredentials.myDB);
clientSub.auth(myCredentials.myAuth, function() {
  trace("Connected successfully to Redis");
});

clientSub.subscribe("motionValue");
clientSub.subscribe("pushValue");
clientSub.subscribe("webValue");
clientSub.subscribe("photoValue");
clientSub.subscribe("potValue");
clientSub.subscribe("pingValue");
clientSub.subscribe("webcamValue");
clientSub.subscribe("servoValue");
clientSub.subscribe("ledValue");
clientSub.subscribe("rgbValue");
clientSub.subscribe("textValue");

clientSub.on("error", function(err) {
    trace("Error connecting to redis subscribing server: " + err);
});

clientPub.on("error", function(err) {
    trace("Error connecting to redis publishing server: " + err);
});

clientSub.on("message", function (channel, message) {
    if (channel == 'motionValue') {
        myMotion = message;
        app.io.broadcast('displayMotionValue',myMotion);
    } else if (channel == 'pushValue') {
        myPush = message;
        app.io.broadcast('displayPushValue',myPush);
    } else if (channel == 'photoValue') {
        myPhoto = message;
        app.io.broadcast('displayPhotoValue',myPhoto);
    } else if (channel == 'pingValue') {
        myPing = message;
        app.io.broadcast('displayPingValue',myPing);
    } else if (channel == 'webcamValue') {
         webcamLink = message;
         req.io.broadcast('newWebcamLink',webcamLink);
    } else if (channel == 'potValue') {
         myPot = message;
         app.io.broadcast('displayPotValue',myPot);
    } else if (channel == 'servoValue') {
         myServo = message;
         trace("servo is " + myServo);
         app.io.broadcast('displayServoValue',myServo);
    } else if (channel == 'ledValue') {
         myLed = message;
         trace("led is " + myLed);
         app.io.broadcast('displayLedValue',myLed);
    } else if (channel == 'rgbValue') {
         myRgb = message;
         trace("rgb is " + myRGB);
         app.io.broadcast('displayRgbValue',myRgb);
    } else if (channel == 'textValue') {
         myText = message;
         trace("text is " + myText);
         app.io.broadcast('displayTextValue',myText);
    }
});

function writeToRedis() {
     if (myRGBOld != myRGB) {
         clientPub.publish("rgbValue", myRGB);
         trace("written to redis rgbValue:" + myRGB);
     }

    if (myLedOld != myLed) {
        clientPub.publish("ledValue", myLed);
        trace("written to redis ledValue:" + myLed);
    }

    if (myServoOld != myServo) {
        clientPub.publish("servoValue", myServo);
        trace("written to redis servoValue:" + myServo);
    }

    if (myPiezoOld != myPiezo) {
        clientPub.publish("piezoValue", myPiezo);
        trace("written to redis piezoValue:" + myPiezo);
    }

    if (myTextOld != myText) {
        clientPub.publish("textValue", myText);
        trace("written to redis textValue:" + myText);
    }

    if (myFaceOld != myFace) {
        clientPub.publish("faceValue", myFace);
        trace("written to redis faceValue:" + myFace);
    }

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

    usersOnline++;
    clientPub.publish("usersValue", usersOnline);
    trace(usersOnline + " users online");
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

app.io.route('faceValueChange', function(req) {
    myFace = req.data.myVal;
    req.io.broadcast('displayNewFace',myFace);
    clientPub.publish("faceValue", myFace);
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
    clientPub.publish("usersValue", usersOnline);
    trace(usersOnline + " users online");
    if (usersOnline === 0) {
        clientPub.publish("faceValue", 1);
        clientPub.publish("usersValue", 0);
    } else if (usersOnline <= 0) {
        usersOnline = 0;
        clientPub.publish("usersValue", 0);
    }
});

setInterval(function(){
    writeToRedis();
}, 1000);

app.get('/', function(req, res) {
    res.sendfile(__dirname + '/views/index.html');
});

app.use(express.static(process.cwd() + '/Public'));
app.listen(8080);
trace("Visit to localhost:8080 in your browser");

function trace(text) {
    var date = new Date();
    var hour = date.getHours();
    hour = (hour < 10 ? "0" : "") + hour;
    var min  = date.getMinutes();
    min = (min < 10 ? "0" : "") + min;
    var sec  = date.getSeconds();
    sec = (sec < 10 ? "0" : "") + sec;
    var currentTime;
    currentTime = "[" + hour + ":" + min + ":" + sec + "]";
    console.log(currentTime + " " + text);
}
