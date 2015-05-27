//  NODE.JS HOME SERVER
//
// to do:
// fix initial values...and make sure 8081 makes 8082 change.
//
//


var five = require('johnny-five'),
    express = require('express.io'),
    app = express().http().io(),
    redis = require('redis'),
    myCredentials = require("./Public/js/credentials.js"),
    myArduino = require("./Public/js/arduino.js"),
    currentTime,
    boardLCD = new five.Board({ port: "COM17" }),
    boardMEGA = new five.Board({ port: "COM12" }),
    boardTMP = new five.Board({ port: "COM9" });

clientSub = redis.createClient(myCredentials.myPort, myCredentials.myDB);
clientSub.auth(myCredentials.myAuth);
clientPub = redis.createClient(myCredentials.myPort, myCredentials.myDB),
clientPub.auth(myCredentials.myAuth);

clientSub.subscribe("rgbValue");
clientSub.subscribe("ledValue");
clientSub.subscribe("servoValue");
clientSub.subscribe("piezoValue");
clientSub.subscribe("faceValue");
clientSub.subscribe("textValue");
clientSub.subscribe("usersValue");

clientSub.on("error", function(err) {
    trace("Error connecting to redis subscribe: " + err);
});

clientPub.on("error", function(err) {
    trace("Error connecting to redis publish: " + err);
});

clientSub.on("message", function (channel, message) {
      if (channel == 'rgbValue') {
          trace("Received rgbValue: " + message);
          myArduino.myRGB = message;
          app.io.broadcast('displayNewRGB',myArduino.myRGB);
      } else if (channel == 'ledValue') {
          trace("Received ledValue:" + message);
          myArduino.myLed = message;
          app.io.broadcast('displayNewLED',myArduino.myLed);
      } else if (channel == 'servoValue') {
          trace("Received servoValue:" + message);
          myArduino.myServo = message;
          app.io.broadcast('displayNewMotor',myArduino.myServo);
      } else if (channel == 'faceValue') {
          trace("Received faceValue:" + message);
          myArduino.myFace = message;
      } else if (channel == 'piezoValue') {
          trace("Received piezoValue:" + message);
          myArduino.myPiezo = message;
      } else if (channel == 'textValue') {
          trace("Received textValue:" + message);
          myArduino.myText = message;
          app.io.broadcast('displayNewText',myArduino.myLed);
      } else if (channel == 'usersValue') {
          getTime();
          myArduino.myUsers = currentTime + " -- " + message;
          trace("Received usersValue:" + myArduino.myUsers);
          app.io.broadcast('addNewUser', myArduino.myUsers);
      }
});


boardMEGA.on("ready", function() {
  trace("connected to Arduino MEGA on COM12");
  var led = new five.Led.RGB({
    pins: {
      red: myArduino.pinR1,
      green: myArduino.pinG1,
      blue: myArduino.pinB1
    }, board: boardMEGA
  });

  var led2 = new five.Led.RGB({
    pins: {
      red: myArduino.pinR2,
      green: myArduino.pinG2,
      blue: myArduino.pinB2
    }, board: boardMEGA
  });

  var ledEyeL = new five.Led({ pin: myArduino.pinLedEyeL, board: boardMEGA }),
    ledWebActivated = new five.Led({ pin: myArduino.pinLedWeb, board: boardMEGA }),
    ledEyeR = new five.Led({ pin: myArduino.pinLedEyeR, board: boardMEGA }),
    button = new five.Button({ pin: myArduino.pinButton, board: boardMEGA }),
    piezo = new five.Piezo({ pin: myArduino.pinPiezo, board:boardMEGA }),
    potentiometer = new five.Sensor({ pin: myArduino.pinPotentiometer,freq: 250, board: boardMEGA });
    photoresistor = new five.Sensor({pin: myArduino.pinPhotoresistor,freq: 250, board: boardMEGA });
    servo = new five.Servo({pin: myArduino.pinServo1, type: "standard", board: boardMEGA });
   // var ping = new five.Ping({ pin: pinPing, board: boardMEGA });

 /* boardMEGA.repl.inject({
    pot: myArduino.myPot,
    button: myArduino.myPush,
    piezo: myArduino.myPiezo,
    led: myArduino.myLed,
    led2: led2,
    ledEyeR: myArduino.ledEyeR,
    ledEyeL: myArduino.ledEyeL,
  //  ping:ping,
    ledWebActivated:ledWebActivated,
    pot: potentiometer
  });*/

ledWebActivated.on();

  button.on("down", function() {
    myArduino.myPush = 1;
    clientPub.publish('pushValue', '1' );
  });

  // ping.on("change", function(err, value) {
  //   trace("Object is " + this.in + "inches away");
  // });

  button.on("hold", function() {
     myArduino.myPush = 2;
     if (myArduino.toggleWeb == false) {
        myArduino.toggleWeb = true;
        clientPub.publish('webValue', 'true' );
        trace("WEB ACTIVATED");
        ledWebActivated.on();
      }
      else {
        myArduino.toggleWeb = false;
        clientPub.publish('webValue', 'false' );
        trace("WEB CONTROLS DISABLED");
        ledWebActivated.off();
      }
  });

  button.on("up", function() {
    myArduino.myPush = 0;
    clientPub.publish('pushValue', '0' );
  });

  potentiometer.on("data", function() {
    myArduino.myPot  = this.value;
  });

  photoresistor.on("data", function() {
    myArduino.myPhoto = this.value;
  });

  function playSong() {
        piezo.play({
          song: "A B C D E F G G G G - G F E D C B A A A - A B C D E F G G G G - G F E D C B A A A",
          beats: 1 / 4,
          tempo: 100
        });
  }

  setInterval(function(){
    if (myArduino.myLed == 1) {
        led.on();
        led.color(myArduino.myRGB);
        led2.on();
        led2.color(myArduino.myRGB);
    } else {
        led.off();
    }

    if (myArduino.myLedEyes == 1) {
        ledEyeR.on();
        ledEyeL.on();
    } else {
        ledEyeR.off();
        ledEyeL.off();
    }



    // WEB ACTIVATED //
    if ( myArduino.toggleWeb == true) {
      if (myArduino.myPiezo == 1) {
        myArduino.myPiezo = 0;
        playSong();
      }
      if (myArduino.myServo == 0) {
           // servo.ccw(1);
      } else if (myArduino.myServo == 1) {
           // servo.cw(0);
      } else if (myArduino.myServo == 2) {
           // servo.cw(1);
      }

      //servo.sweep();

    // if (myPush == 1 && myLed == 1) {
    //   if (myPushOld > myPush) {
    //       led.stop();
    //     }
    //     //  led.on();
    //   } else if (myPush == 2 && myLed == 1) {
    //       if (myPushOld > myPush) {
    //         led.stop();
    //         led.on();
    //       }

    //       led.strobe(50);
    //   } else if (myPush == 3 & myLed == 1) {
    //       led.strobe(50);
    //   }
    }
    myArduino.myPushOld = myArduino.myPush;
  }, 1000);

  try {
       setInterval(function(){
      if (myArduino.myPot!=myArduino.myPotOld) {
        clientPub.publish('potValue', myArduino.myPot );
        app.io.broadcast('displayPotValue',myArduino.myPot);
      }
      myArduino.myPot=myArduino.myPotOld;

      if (myArduino.myPhoto!=myArduino.myPhotoOld) {
        clientPub.publish('photoValue', myArduino.myPhoto );
        app.io.broadcast('displayPhotoValue',myArduino.myPhoto);
      }
      myArduino.myPhoto=myArduino.myPhotoOld;
    }, 10000);  // change to something logical
  } catch(e) {
      getDateTime();
      trace("Error: " + e);
  }
});



boardLCD.on("ready", function() {
  trace("connected to Arduino (LCD) on COM11");

  var p = new five.LCD({
    pins: [myArduino.pinLCD1, myArduino.pinLCD2, myArduino.pinLCD3, myArduino.pinLCD4, myArduino.pinLCD5, myArduino.pinLCD6],
    backlight: myArduino.pinLCD7,
  });
  try {
    setInterval(function(){
      if (myArduino.myPush == 1) {
        p.cursor(0, 0).print(myArduino.myText);
        p.cursor(1, 0).print(myArduino.myText);
      } else {
          if (myArduino.myFace==0) {
            p.useChar("circle");
            p.cursor(0, 0).print("   --      --");
            p.cursor(1, 0).print("    :circle:      :circle:");
          } else if (myArduino.myFace==1) {
            p.cursor(0, 0).print("   --      --");
            p.cursor(1, 0).print("    -      -");
          } else if (myArduino.myFace==2) {
            p.useChar("x");
            p.cursor(0, 0).print("   --      --");
            p.cursor(1, 0).print("    :x:      :x:");
          } else if (myArduino.myFace==3) {
            p.useChar("sound");
            p.cursor(0, 0).print("   --      --");
            p.cursor(1, 0).print("    :sound:      :sound:");
          } else if (myArduino.myFace==4) {
            p.useChar("heart");
            p.cursor(0, 0).print("   --      --");
            p.cursor(1, 0).print("    :heart:      :heart:");
          } else if (myArduino.myFace==5) {
            p.useChar("cdot");
            p.cursor(0, 0).print("   --      --");
            p.cursor(1, 0).print("    :cdot:      :cdot:");
          } else if (myArduino.myFace==6) {
            p.useChar("ball");
            p.cursor(0, 0).print("   --      --");
            p.cursor(1, 0).print("    :ball:      :ball:");
          } else if (myArduino.myFace==7) {
            p.useChar("cent");
            p.cursor(0, 0).print("   --      --");
            p.cursor(1, 0).print("    :cent:      :cent:");
          } else if (myArduino.myFace==8) {
            p.useChar("donut");
            p.cursor(0, 0).print("   --      --");
            p.cursor(1, 0).print("    :donut:      :donut:");
          } else if (myArduino.myFace==9) {
            p.useChar("euro");
            p.cursor(0, 0).print("   --      --");
            p.cursor(1, 0).print("    :euro:      :euro:");
          } else if (myArduino.myFace==10) {
            p.useChar("circle");
            p.cursor(0, 0).print("   /        \\");
            p.cursor(1, 0).print("    :circle:      :circle:");
          } else if (myArduino.myFace==11) {
            p.cursor(0, 0).print("   /        \\");
            p.cursor(1, 0).print("    -      -");
          } else if (myArduino.myFace==12) {
            p.useChar("x");
            p.cursor(0, 0).print("   /        \\");
            p.cursor(1, 0).print("    :x:      :x:");
          } else if (myArduino.myFace==13) {
            p.useChar("sound");
            p.cursor(0, 0).print("   /        \\");
            p.cursor(1, 0).print("    :sound:      :sound:");
          } else if (myArduino.myFace==14) {
            p.useChar("heart");
            p.cursor(0, 0).print("   /        \\");
            p.cursor(1, 0).print("    :heart:      :heart:");
          } else if (myArduino.myFace==15) {
            p.useChar("cdot");
            p.cursor(0, 0).print("   /        \\");
            p.cursor(1, 0).print("    :cdot:      :cdot:");
          } else if (myArduino.myFace==16) {
            p.useChar("ball");
            p.cursor(0, 0).print("   /        \\");
            p.cursor(1, 0).print("    :ball:      :ball:");
          } else if (myArduino.myFace==17) {
            p.useChar("cent");
            p.cursor(0, 0).print("   /        \\");
            p.cursor(1, 0).print("    :cent:      :cent:");
          } else if (myArduino.myFace==18) {
            p.useChar("donut");
            p.cursor(0, 0).print("   /        \\");
            p.cursor(1, 0).print("    :donut:      :donut:");
          } else if (myArduino.myFace==19) {
            p.useChar("euro");
            p.cursor(0, 0).print("   --      --");
            p.cursor(1, 0).print("    :euro:      :euro:");
          } else if (myArduino.myFace==20) {
            p.useChar("circle");
            p.cursor(0, 0).print("    \\      / ");
            p.cursor(1, 0).print("    :circle:      :circle:");
          } else if (myArduino.myFace==21) {
            p.cursor(0, 0).print("    \\      / ");
            p.cursor(1, 0).print("    -      -");
          } else if (myArduino.myFace==22) {
            p.useChar("x");
            p.cursor(0, 0).print("    \\      / ");
            p.cursor(1, 0).print("    :x:      :x:");
          } else if (myArduino.myFace==23) {
            p.useChar("sound");
            p.cursor(0, 0).print("    \\      / ");
            p.cursor(1, 0).print("    :sound:      :sound:");
          } else if (myArduino.myFace==24) {
            p.useChar("heart");
            p.cursor(0, 0).print("    \\      / ");
            p.cursor(1, 0).print("    :heart:      :heart:");
          } else if (myArduino.myFace==25) {
            p.useChar("cdot");
            p.cursor(0, 0).print("    \\      / ");
            p.cursor(1, 0).print("    :cdot:      :cdot:");
          } else if (myArduino.myFace==26) {
            p.useChar("ball");
            p.cursor(0, 0).print("    \\      / ");
            p.cursor(1, 0).print("    :ball:      :ball:");
          } else if (myArduino.myFace==27) {
            p.useChar("cent");
            p.cursor(0, 0).print("    \\      / ");
            p.cursor(1, 0).print("    :cent:      :cent:");
          } else if (myArduino.myFace==28) {
            p.useChar("donut");
            p.cursor(0, 0).print("    \\      / ");
            p.cursor(1, 0).print("    :donut:      :donut:");
          } else if (myArduino.myFace==29) {
            p.useChar("euro");
            p.cursor(0, 0).print("    \\      / ");
            p.cursor(1, 0).print("    :euro:      :euro:");
          } else if (myArduino.myFace==30) {
            p.useChar("circle");
            p.cursor(0, 0).print("   --      --");
            p.cursor(1, 0).print("    :circle:      :circle:");
          }
       }
    }, 1000);
  } catch(e) {
      getDateTime();
      trace("Error: " + e);
  }

});



boardTMP.on("ready", function() {
  trace("connected to Arduino TMP on COM9");
  var ledTest = new five.Led.RGB({
    pins: {
      red: 9,
      green: 10,
      blue: 11
    }, board: boardTMP
  });
        ledTest.on();
        ledTest.color(myArduino.myPingRGB);
});


function getTime() {
   var date = new Date();
    var hour = date.getHours();
    hour = (hour < 10 ? "0" : "") + hour;
    var min  = date.getMinutes();
    min = (min < 10 ? "0" : "") + min;
    var sec  = date.getSeconds();
    sec = (sec < 10 ? "0" : "") + sec;
    currentTime = "[" + hour + ":" + min + ":" + sec + "]";
}

function trace(text) {
    getTime();
    console.log(currentTime + " " + text);
}

app.get('/', function(req, res) {
    res.sendfile(__dirname + '/views/home.html');
});

app.use(express.static(process.cwd() + '/Public'));
app.listen(8082);
trace("Visit to localhost:8082 in your browser to view Admin Console");

app.io.route('getInitialValues', function(req) {
    req.io.emit('displayInitialValues', {
        myPhoto: myArduino.myPhoto,
        myPot: myArduino.myPot,
        myPing: myArduino.myPing,
        myServo: myArduino.myServo,
        myPush: myArduino.myPush,
        myRGB: myArduino.myRGB,
        myLed: myArduino.myLed,
        myMotion: myArduino.myMotion,
        myFace: myArduino.myFace,
        myText: myArduino.myText,
        myOnline: myArduino.myOnline,
        myWebcam: myArduino.myWebcam,
        myRosieRGB: myArduino.myRosieRGB,
        myPingRGB : myArduino.myPingRGB,
        myLedEyes: myArduino.myLedEyes,
        myLCDEyes: myArduino.myLCDEyes,
        myLCDEyeBrows: myArduino.myLCDEyeBrows
    });
});

app.io.route('onlineValueChange', function(req) {
    myArduino.myOnline = req.data.myVal;
    trace("Received myOnline: " + myArduino.myOnline);
    req.io.broadcast('displayNewOnline',myArduino.myOnline);
});

app.io.route('servoValueChange', function(req) {
    myArduino.myServo = req.data.myVal;
    trace("Received myServo: " + myArduino.myServo);
    clientPub.publish("servoValue", myArduino.myServo);
  //  req.io.broadcast('displayNewServo',myArduino.myServo);
 });

app.io.route('rgbValueChange', function(req) {
     myArduino.myRGB = req.data.myVal;
     clientPub.publish("rgbValue", myArduino.myRGB);  //publises but others dont
     trace("Received myRGB: " + myArduino.myRGB);
 //    req.io.broadcast('displayNewRGB',myArduino.myRGB);
 });

app.io.route('webcamChange', function(req) {
     myArduino.myWebcam = req.data.myVal;
     trace("Received myWebcam: " + myArduino.myWebcam);
     clientPub.publish("webcamValue", myArduino.myWebcam);  //publises but others dont
 });

app.io.route('rosieRgbValueChange', function(req) {
     myArduino.myRosieRGB = req.data.myVal;
     trace("Received myRosieRGB: " + myArduino.myRosieRGB);
     req.io.broadcast('displayNewRosieRGB',myArduino.myRosieRGB);
 });

app.io.route('pingRgbValueChange', function(req) {
     myArduino.myPingRGB = req.data.myVal;
     trace("Received myPingRGB: " + myArduino.myPingRGB);
     req.io.broadcast('displayNewPingRGB',myArduino.myPingRGB);
 });

app.io.route('ledValueChange', function(req) {
    myArduino.myLed = req.data.myVal;
    trace("Received myLed: " + myArduino.myLed);
    clientPub.publish("ledValue", myArduino.myLed);
    req.io.broadcast('displayNewLED',myArduino.myLed);
});

app.io.route('ledEyesValueChange', function(req) {
    myArduino.myLedEyes = req.data.myVal;
    trace("Received myLedEyes: " + myArduino.myLedEyes);
    req.io.broadcast('displayNewLEDEyes',myArduino.myLedEyes);
});

app.io.route('textValueChange', function(req) {
    myArduino.myText = req.data.myVal;
    trace("Received myText: " + myArduino.myText);
    req.io.broadcast('displayNewText',myArduino.myText);
    clientPub.publish("textValue", myArduino.myText);
});

app.io.route('lcdEyesChange', function(req) {
    myArduino.myLCDEyes = req.data.myVal;
    trace(myArduino.myLCDEyes);
   // req.io.broadcast('displayNewText',myLCDEyes);        // not needed if they are buttons
   //             look into button toolbar in bootstrap
});

app.io.route('lcdEyeBrowsChange', function(req) {
    myArduino.myLCDEyeBrows = req.data.myVal;
    trace(myArduino.myLCDEyeBrows);
   // req.io.broadcast('displayNewText',myLCDEyeBrows);    // not needed if they are buttons
     //             look into button toolbar in bootstrap
});
