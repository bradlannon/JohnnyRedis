//  NODE.JS HOME SERVER
//
//
//
//
//var memwatch = require('memwatch');
var five = require('johnny-five'),
    express = require('express.io'),
    app = express().http().io(),
    redis = require('redis'),
    pinLCD1 = 8,
    pinLCD2 = 9,
    pinLCD3 = 4,
    pinLCD4 = 5,
    pinLCD5 = 6,
    pinLCD6 = 7,
    pinLCD7 = 10,
    pinPhotoresistor = "A0",        // works
    pinPotentiometer = "A5",
    pinButton =26,                 // works
    pinR = 2,                       // works but add lower resistor
    pinG = 3,                       // works
    pinB = 4,                       // works
    pinPing=25,
    pinMotion = 13,
    pinPiezo = 7,                   // works but crackily
    pinServo1 = 12,
    pinLedEyeL = 23,                // works
    pinLedEyeR = 22,                // works
    pinLedWeb = 24,                 // works
    toggleWeb = true,
    myPot = 0,
    myPhoto = 0,
    myPotOld = 0,
    myPhotoOld = 0,
    myServo = 1,
    myPush = 0,
    myPushOld = 0,
    myPing = 0,
    myMotion = 0,
    myPingOld = 0,
    myMotionOld = 0,
    myFace = 1,
    myRGB = '#00FFDD',
    myPingRGB = '#00FFDD',
    myRosieRGB = '#00FFDD',
    myPiezo = 1,
    myLed = 1,
    myLedEyes = 1,
    myLCDEyes = 1,
    myLCDEyeBrows = 1,
    myText = '',
    myWebcam = '',
    myUsers = 0,
    currentTime,
    myCredentials = require("./credentials.js"),
    boardLCD = new five.Board({ port: "COM11" }),
    boardMEGA = new five.Board({ port: "COM12" });
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
clientSub.subscribe("nameValue");
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
          myRGB = message;
         // app.io.broadcast('addNewUser',myRGB);
      } else if (channel == 'ledValue') {
          trace("Received ledValue:" + message);
          myLed = message;
          // app.io.broadcast('addNewUser',myLed);
      } else if (channel == 'servoValue') {
          trace("Received servoValue:" + message);
          myServo = message;
      } else if (channel == 'faceValue') {
          trace("Received faceValue:" + message);
          myFace = message;
      } else if (channel == 'piezoValue') {
          trace("Received piezoValue:" + message);
          myPiezo = message;
      } else if (channel == 'faceValue') {
          trace("Received faceValue:" + message);
          myFace = message;
      } else if (channel == 'textValue') {
          trace("Received textValue:" + message);
          myText = message;
      } else if (channel == 'nameValue') {
          trace("Received nameValue:" + message);
          myName = message;
      } else if (channel == 'usersValue') {
          getTime();
          myUsers = currentTime + " -- " + message;
          trace("Received usersValue:" + myUsers);
          app.io.broadcast('addNewUser',myUsers);
      }
});


boardMEGA.on("ready", function() {
  trace("connected to Arduino MEGA on COM12");
  var led = new five.Led.RGB({
    pins: {
      red: pinR,
      green: pinG,
      blue: pinB
    }, board: boardMEGA
  });

  var led2 = new five.Led.RGB({
    pins: {
      red: 8,
      green: 9,
      blue: 10
    }, board: boardMEGA
  });

  var ledEyeL = new five.Led({ pin: pinLedEyeL, board: boardMEGA }),
    ledWebActivated = new five.Led({ pin: pinLedWeb, board: boardMEGA }),
    ledEyeR = new five.Led({ pin: pinLedEyeR, board: boardMEGA }),
    button = new five.Button({ pin: pinButton, board: boardMEGA }),
    piezo = new five.Piezo({ pin: pinPiezo, board:boardMEGA }),
    potentiometer = new five.Sensor({ pin: pinPotentiometer,freq: 250, board: boardMEGA });
    photoresistor = new five.Sensor({pin: pinPhotoresistor,freq: 250, board: boardMEGA });
    servo = new five.Servo({pin: pinServo1, type: "standard", board: boardMEGA });
   // var ping = new five.Ping({ pin: pinPing, board: boardMEGA });

  boardMEGA.repl.inject({
    pot: photoresistor,
    button: button,
    piezo: piezo,
    led: led,
    led2: led2,
    ledEyeR: ledEyeR,
    ledEyeL: ledEyeL,
  //  ping:ping,
    ledWebActivated:ledWebActivated,
    pot: potentiometer
  });

ledWebActivated.on();

  button.on("down", function() {
    myPush = 1;
    clientPub.publish('pushValue', '1' );
  });


 // ping.on("change", function(err, value) {
 //   trace("Object is " + this.in + "inches away");
 // });

  button.on("hold", function() {
     myPush = 2;
     if (toggleWeb == false) {
        toggleWeb = true;
        clientPub.publish('toggleWeb', 'true' );
        trace("WEB ACTIVATED");
        ledWebActivated.on();
      }
      else {
        toggleWeb = false;
        clientPub.publish('toggleWeb', 'false' );
        trace("WEB CONTROLS DISABLED");
        ledWebActivated.off();
      }
  });

  button.on("up", function() {
    myPush = 0;
    clientPub.publish('pushValue', '0' );
  });

  potentiometer.on("data", function() {
    myPot  = this.value;
  });

  photoresistor.on("data", function() {
    myPhoto = this.value;
  });

  function playSong() {
        piezo.play({
          song: "A B C D E F G G G G - G F E D C B A A A - A B C D E F G G G G - G F E D C B A A A",
          beats: 1 / 4,
          tempo: 100
        });
  }

  setInterval(function(){
    if (myLed == 1) {
        led.on();
        led.color(myRGB);
        led2.on();
        led2.color(myRGB);
    } else {
        led.off();
    }

    if (myLedEyes == 1) {
        ledEyeR.on();
        ledEyeL.on();
    } else {
        ledEyeR.off();
        ledEyeL.off();
    }



    // WEB ACTIVATED //
    if ( toggleWeb == true) {
      if (myPiezo == 1) {
        myPiezo = 0;
        playSong();
      }
      if (myServo == 0) {
           // servo.ccw(1);
      } else if (myServo == 1) {
           // servo.cw(0);
      } else if (myServo == 2) {
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
    myPushOld = myPush;
  }, 1000);

  try {
       setInterval(function(){
      if (myPot!=myPotOld) {
        clientPub.publish('potValue', myPot );
        app.io.broadcast('displayPotValue',myPot);
      }
      myPot=myPotOld;

      if (myPhoto!=myPhotoOld) {
        clientPub.publish('photoValue', myPhoto );
        app.io.broadcast('displayPhotoValue',myPhoto);
      }
      myPhoto=myPhotoOld;
    }, 10000);  // change to something logical
  } catch(e) {
      getDateTime();
      trace("Error: " + e);
  }



});



boardLCD.on("ready", function() {
  trace("connected to Arduino (LCD) on COM11");

  var p = new five.LCD({
    pins: [pinLCD1, pinLCD2, pinLCD3, pinLCD4, pinLCD5, pinLCD6],
    backlight: pinLCD7,
  });
  try {
    setInterval(function(){
      if (myPush == 1) {
        p.cursor(0, 0).print(myText);
          p.cursor(1, 0).print(myText);
      } else {
          if (myFace==0) {
            p.useChar("circle");
            p.cursor(0, 0).print("   --      --");
            p.cursor(1, 0).print("    :circle:      :circle:");
          } else if (myFace==1) {
            p.cursor(0, 0).print("   --      --");
            p.cursor(1, 0).print("    -      -");
          } else if (myFace==2) {
            p.useChar("x");
            p.cursor(0, 0).print("   --      --");
            p.cursor(1, 0).print("    :x:      :x:");
          } else if (myFace==3) {
            p.useChar("sound");
            p.cursor(0, 0).print("   --      --");
            p.cursor(1, 0).print("    :sound:      :sound:");
          } else if (myFace==4) {
            p.useChar("heart");
            p.cursor(0, 0).print("   --      --");
            p.cursor(1, 0).print("    :heart:      :heart:");
          } else if (myFace==5) {
            p.useChar("cdot");
            p.cursor(0, 0).print("   --      --");
            p.cursor(1, 0).print("    :cdot:      :cdot:");
          } else if (myFace==6) {
            p.useChar("ball");
            p.cursor(0, 0).print("   --      --");
            p.cursor(1, 0).print("    :ball:      :ball:");
          } else if (myFace==7) {
            p.useChar("cent");
            p.cursor(0, 0).print("   --      --");
            p.cursor(1, 0).print("    :cent:      :cent:");
          } else if (myFace==8) {
            p.useChar("donut");
            p.cursor(0, 0).print("   --      --");
            p.cursor(1, 0).print("    :donut:      :donut:");
          } else if (myFace==9) {
            p.useChar("euro");
            p.cursor(0, 0).print("   --      --");
            p.cursor(1, 0).print("    :euro:      :euro:");
          } else if (myFace==10) {
            p.useChar("circle");
            p.cursor(0, 0).print("   /        \\");
            p.cursor(1, 0).print("    :circle:      :circle:");
          } else if (myFace==11) {
            p.cursor(0, 0).print("   /        \\");
            p.cursor(1, 0).print("    -      -");
          } else if (myFace==12) {
            p.useChar("x");
            p.cursor(0, 0).print("   /        \\");
            p.cursor(1, 0).print("    :x:      :x:");
          } else if (myFace==13) {
            p.useChar("sound");
            p.cursor(0, 0).print("   /        \\");
            p.cursor(1, 0).print("    :sound:      :sound:");
          } else if (myFace==14) {
            p.useChar("heart");
            p.cursor(0, 0).print("   /        \\");
            p.cursor(1, 0).print("    :heart:      :heart:");
          } else if (myFace==15) {
            p.useChar("cdot");
            p.cursor(0, 0).print("   /        \\");
            p.cursor(1, 0).print("    :cdot:      :cdot:");
          } else if (myFace==16) {
            p.useChar("ball");
            p.cursor(0, 0).print("   /        \\");
            p.cursor(1, 0).print("    :ball:      :ball:");
          } else if (myFace==17) {
            p.useChar("cent");
            p.cursor(0, 0).print("   /        \\");
            p.cursor(1, 0).print("    :cent:      :cent:");
          } else if (myFace==18) {
            p.useChar("donut");
            p.cursor(0, 0).print("   /        \\");
            p.cursor(1, 0).print("    :donut:      :donut:");
          } else if (myFace==19) {
            p.useChar("euro");
            p.cursor(0, 0).print("   --      --");
            p.cursor(1, 0).print("    :euro:      :euro:");
          } else if (myFace==20) {
            p.useChar("circle");
            p.cursor(0, 0).print("    \\      / ");
            p.cursor(1, 0).print("    :circle:      :circle:");
          } else if (myFace==21) {
            p.cursor(0, 0).print("    \\      / ");
            p.cursor(1, 0).print("    -      -");
          } else if (myFace==22) {
            p.useChar("x");
            p.cursor(0, 0).print("    \\      / ");
            p.cursor(1, 0).print("    :x:      :x:");
          } else if (myFace==23) {
            p.useChar("sound");
            p.cursor(0, 0).print("    \\      / ");
            p.cursor(1, 0).print("    :sound:      :sound:");
          } else if (myFace==24) {
            p.useChar("heart");
            p.cursor(0, 0).print("    \\      / ");
            p.cursor(1, 0).print("    :heart:      :heart:");
          } else if (myFace==25) {
            p.useChar("cdot");
            p.cursor(0, 0).print("    \\      / ");
            p.cursor(1, 0).print("    :cdot:      :cdot:");
          } else if (myFace==26) {
            p.useChar("ball");
            p.cursor(0, 0).print("    \\      / ");
            p.cursor(1, 0).print("    :ball:      :ball:");
          } else if (myFace==27) {
            p.useChar("cent");
            p.cursor(0, 0).print("    \\      / ");
            p.cursor(1, 0).print("    :cent:      :cent:");
          } else if (myFace==28) {
            p.useChar("donut");
            p.cursor(0, 0).print("    \\      / ");
            p.cursor(1, 0).print("    :donut:      :donut:");
          } else if (myFace==29) {
            p.useChar("euro");
            p.cursor(0, 0).print("    \\      / ");
            p.cursor(1, 0).print("    :euro:      :euro:");
          } else if (myFace==30) {
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
        ledTest.color(myPingRGB);
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
});

app.io.route('onlineValueChange', function(req) {
    myOnline = req.data.myVal;
    req.io.broadcast('displayNewOnline',myOnline);
});

app.io.route('servoValueChange', function(req) {
    myServo = req.data.myVal;
    req.io.broadcast('displayNewServo',myServo);
    //send this to redis SOMETIMES because if I make a change, then  it had to show up online website, eg led on or rgb color change
});

app.io.route('rgbValueChange', function(req) {
     myRGB = req.data.myVal;
     clientPub.publish("rgbValue", myRGB);  //publises but others dont
     req.io.broadcast('displayNewRGB',myRGB);
 });

app.io.route('webcamChange', function(req) {
     myWebcam = req.data.myVal;
     clientPub.publish("webcamValue", myWebcam);  //publises but others dont
 });

app.io.route('rosieRgbValueChange', function(req) {
     myRosieRGB = req.data.myVal;
     req.io.broadcast('displayNewRosieRGB',myRosieRGB);
 });

app.io.route('pingRgbValueChange', function(req) {
     myPingRGB = req.data.myVal;
     req.io.broadcast('displayNewPingRGB',myPingRGB);
 });

app.io.route('ledValueChange', function(req) {
    myLed = req.data.myVal;
    req.io.broadcast('displayNewLED',myLed);
});

app.io.route('ledEyesValueChange', function(req) {
    myLedEyes = req.data.myVal;
    req.io.broadcast('displayNewLEDEyes',myLedEyes);
});

app.io.route('textValueChange', function(req) {
    myText = req.data.myVal;
    req.io.broadcast('displayNewText',myText);
    clientPub.publish("textValue", myText);
});

app.io.route('lcdEyesChange', function(req) {
    myLCDEyes = req.data.myVal;
    trace(myLCDEyes);
   // req.io.broadcast('displayNewText',myLCDEyes);        // not needed if they are buttons
   //             look into button toolbar in bootstrap
});

app.io.route('lcdEyeBrowsChange', function(req) {
    myLCDEyeBrows = req.data.myVal;
    trace(myLCDEyeBrows);
   // req.io.broadcast('displayNewText',myLCDEyeBrows);    // not needed if they are buttons
     //             look into button toolbar in bootstrap
});
