//  NODE.JS HOME SERVER
//
//
//
//

var five = require('johnny-five'),
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
    pinServo1 = 9,
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
    myLcd = 4,
    myRGB = '#00FFDD',
    myPiezo = 1,
    myLed = 1,
    myCredentials = require("./credentials.js"),
    boardLCD = new five.Board({ port: "COM5" }),
    boardMEGA = new five.Board({ port: "COM8" });
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

clientSub.on("message", function (channel, message) {
     if (channel == 'rgbValue') {
          console.log("Received rgbValue: " + message);
          myRGB = message;
      } else if (channel == 'ledValue') {
          console.log("Received ledValue:" + message);
          myLed = message;
      } else if (channel == 'servoValue') {
          console.log("Received servoValue:" + message);
          myServo = message;
      } else if (channel == 'faceValue') {
          console.log("Received faceValue:" + message);
          myFace = message;
      } else if (channel == 'piezoValue') {
          console.log("Received piezoValue:" + message);
          myPiezo = message;
      } else if (channel == 'textValue') {
          console.log("Received textValue:" + message);
          myText = message;
      } else if (channel == 'nameValue') {
          console.log("Received nameValue:" + message);
          myName = message;
      } 
});


boardMEGA.on("ready", function() {
  console.log("connected to Arduino MEGA on COM8");
  var led = new five.Led.RGB({
    pins: {
      red: pinR,
      green: pinG,
      blue: pinB
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
    ledEyeR: ledEyeR,
    ledEyeL: ledEyeL,
  //  ping:ping,
    ledWebActivated:ledWebActivated,
    pot: potentiometer
  });

  ledEyeR.on();
  ledEyeL.on();
  ledWebActivated.on();

  button.on("down", function() {
    myPush = 1;
    clientPub.publish('pushValue', '1' );
  });


 // ping.on("change", function(err, value) {
 //   console.log("Object is " + this.in + "inches away");
 // });

  button.on("hold", function() {
     myPush = 2;
     if (toggleWeb == false) {
        toggleWeb = true;
        clientPub.publish('toggleWeb', 'true' );
        console.log("WEB ACTIVATED");
        ledWebActivated.on();
      }
      else {
        toggleWeb = false;
        clientPub.publish('toggleWeb', 'false' );
        console.log("WEB CONTROLS DISABLED");
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
          song: "A B C D E F G G G G",
          beats: 1 / 4,
          tempo: 140
        });
  }

  setInterval(function(){
    if (myLed == 1) {
        led.on();
        led.color(myRGB);
    } else {
        led.off();
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


  setInterval(function(){
    if (myPot!=myPotOld) {
      console.log("myPot changed " + myPot);
      clientPub.publish('potValue', myPot );
    }
    myPot=myPotOld;

    if (myPhoto!=myPhotoOld) {
      console.log("myPhoto changed " + myPhoto);
      clientPub.publish('photoValue', myPhoto );
    }
    myPhoto=myPhotoOld;
  }, 10000);  // change to something logical

});



boardLCD.on("ready", function() {
  console.log("connected to Arduino (LCD) on COM5");

  var p = new five.LCD({
    pins: [pinLCD1, pinLCD2, pinLCD3, pinLCD4, pinLCD5, pinLCD6],
    backlight: pinLCD7,
  });

  setInterval(function(){
    if (myLcd==0) {
      p.useChar("circle");
      p.cursor(0, 0).print("   --      --");
      p.cursor(1, 0).print("    :circle:      :circle:");
    } else if (myLcd==1) {
      p.cursor(0, 0).print("   --      --");
      p.cursor(1, 0).print("    -      -");
    } else if (myLcd==2) {
      p.useChar("x");
      p.cursor(0, 0).print("   --      --");
      p.cursor(1, 0).print("    :x:      :x:");
    } else if (myLcd==3) {
      p.useChar("sound");
      p.cursor(0, 0).print("   --      --");
      p.cursor(1, 0).print("    :sound:      :sound:");
    } else if (myLcd==4) {
      p.useChar("heart");
      p.cursor(0, 0).print("   --      --");
      p.cursor(1, 0).print("    :heart:      :heart:");
    } else if (myLcd==5) {
      p.useChar("cdot");
      p.cursor(0, 0).print("   --      --");
      p.cursor(1, 0).print("    :cdot:      :cdot:");
    } else if (myLcd==6) {
      p.useChar("ball");
      p.cursor(0, 0).print("   --      --");
      p.cursor(1, 0).print("    :ball:      :ball:");
    } else if (myLcd==7) {
      p.useChar("cent");
      p.cursor(0, 0).print("   --      --");
      p.cursor(1, 0).print("    :cent:      :cent:");
    } else if (myLcd==8) {
      p.useChar("donut");
      p.cursor(0, 0).print("   --      --");
      p.cursor(1, 0).print("    :donut:      :donut:");
    } else if (myLcd==9) {
      p.useChar("euro");
      p.cursor(0, 0).print("   --      --");
      p.cursor(1, 0).print("    :euro:      :euro:");
    } else if (myLcd==10) {
      p.useChar("circle");
      p.cursor(0, 0).print("   /        \\");
      p.cursor(1, 0).print("    :circle:      :circle:");
    } else if (myLcd==11) {
      p.cursor(0, 0).print("   /        \\");
      p.cursor(1, 0).print("    -      -");
    } else if (myLcd==12) {
      p.useChar("x");
      p.cursor(0, 0).print("   /        \\");
      p.cursor(1, 0).print("    :x:      :x:");
    } else if (myLcd==13) {
      p.useChar("sound");
      p.cursor(0, 0).print("   /        \\");
      p.cursor(1, 0).print("    :sound:      :sound:");
    } else if (myLcd==14) {
      p.useChar("heart");
      p.cursor(0, 0).print("   /        \\");
      p.cursor(1, 0).print("    :heart:      :heart:");
    } else if (myLcd==15) {
      p.useChar("cdot");
      p.cursor(0, 0).print("   /        \\");
      p.cursor(1, 0).print("    :cdot:      :cdot:");
    } else if (myLcd==16) {
      p.useChar("ball");
      p.cursor(0, 0).print("   /        \\");
      p.cursor(1, 0).print("    :ball:      :ball:");
    } else if (myLcd==17) {
      p.useChar("cent");
      p.cursor(0, 0).print("   /        \\");
      p.cursor(1, 0).print("    :cent:      :cent:");
    } else if (myLcd==18) {
      p.useChar("donut");
      p.cursor(0, 0).print("   /        \\");
      p.cursor(1, 0).print("    :donut:      :donut:");
    } else if (myLcd==19) {
      p.useChar("euro");
      p.cursor(0, 0).print("   --      --");
      p.cursor(1, 0).print("    :euro:      :euro:");
    } else if (myLcd==20) {
      p.useChar("circle");
      p.cursor(0, 0).print("    \\      / ");
      p.cursor(1, 0).print("    :circle:      :circle:");
    } else if (myLcd==21) {
      p.cursor(0, 0).print("    \\      / ");
      p.cursor(1, 0).print("    -      -");
    } else if (myLcd==22) {
      p.useChar("x");
      p.cursor(0, 0).print("    \\      / ");
      p.cursor(1, 0).print("    :x:      :x:");
    } else if (myLcd==23) {
      p.useChar("sound");
      p.cursor(0, 0).print("    \\      / ");
      p.cursor(1, 0).print("    :sound:      :sound:");
    } else if (myLcd==24) {
      p.useChar("heart");
      p.cursor(0, 0).print("    \\      / ");
      p.cursor(1, 0).print("    :heart:      :heart:");
    } else if (myLcd==25) {
      p.useChar("cdot");
      p.cursor(0, 0).print("    \\      / ");
      p.cursor(1, 0).print("    :cdot:      :cdot:");
    } else if (myLcd==26) {
      p.useChar("ball");
      p.cursor(0, 0).print("    \\      / ");
      p.cursor(1, 0).print("    :ball:      :ball:");
    } else if (myLcd==27) {
      p.useChar("cent");
      p.cursor(0, 0).print("    \\      / ");
      p.cursor(1, 0).print("    :cent:      :cent:");
    } else if (myLcd==28) {
      p.useChar("donut");
      p.cursor(0, 0).print("    \\      / ");
      p.cursor(1, 0).print("    :donut:      :donut:");
    } else if (myLcd==29) {
      p.useChar("euro");
      p.cursor(0, 0).print("    \\      / ");
      p.cursor(1, 0).print("    :euro:      :euro:");
    } else if (myLcd==30) {
      p.useChar("circle");
      p.cursor(0, 0).print("   --      --");
      p.cursor(1, 0).print("    :circle:      :circle:");
    } else if (myLcd==31) {
      p.cursor(0, 0).print("   --      --");
      p.cursor(1, 0).print("    -      -");
    } else if (myLcd==32) {
      p.useChar("x");
      p.cursor(0, 0).print("   --      --");
      p.cursor(1, 0).print("    :x:      :x:");
    } else if (myLcd=33) {
      p.useChar("sound");
      p.cursor(0, 0).print("   --      --");
      p.cursor(1, 0).print("    :sound:      :sound:");
    } else if (myLcd==34) {
      p.useChar("heart");
      p.cursor(0, 0).print("   --      --");
      p.cursor(1, 0).print("    :heart:      :heart:");
    } else if (myLcd==35) {
      p.useChar("cdot");
      p.cursor(0, 0).print("   --      --");
      p.cursor(1, 0).print("    :cdot:      :cdot:");
    } else if (myLcd==36) {
      p.useChar("ball");
      p.cursor(0, 0).print("   --      --");
      p.cursor(1, 0).print("    :ball:      :ball:");
    } else if (myLcd==37) {
      p.useChar("cent");
      p.cursor(0, 0).print("   --      --");
      p.cursor(1, 0).print("    :cent:      :cent:");
    } else if (myLcd==38) {
      p.useChar("donut");
      p.cursor(0, 0).print("   --      --");
      p.cursor(1, 0).print("    :donut:      :donut:");
    } else if (myLcd==39) {
      p.useChar("euro");
      p.cursor(0, 0).print("   --      --");
      p.cursor(1, 0).print("    :euro:      :euro:");
    }
  }, 1000);
});



boardTMP.on("ready", function() {
  console.log("connected to Arduino TMP on COM9");
  var ledTest = new five.Led.RGB({
    pins: {
      red: 9,
      green: 10,
      blue: 11
    }, board: boardTMP
  });
        ledTest.on();
        ledTest.color(myRGB);
});
