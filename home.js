//  NODE.JS HOME SERVER
//
//
//
//
//var memwatch = require('memwatch');
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
    pinPiezo = 7,                   // works but crackily
    pinServo1 = 9,
    pin2R = 9,                       // works..
    pin2G = 10,                       // works..
    pin2B = 11,                       // works..
    pinMotion = 13,
    pinLedEyeR = 22,                // works
    pinLedEyeL = 23,                // works
    pinLedWeb = 24,                 // works
    pinPing=25,
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
    myFace = 4,
    myRGB = '#00FFDD',
    myPiezo = 1,
    myLed = 1,
    myText = '',
    myWebcamValue = "mediastream:http://simpl.info/90cfcc76-740d-4610-a776-7902690b0967",
    myCredentials = require("./credentials.js"),
    boardLCD = new five.Board({ port: "COM11" }),
    boardMEGA = new five.Board({ port: "COM12" });
    boardTMP = new five.Board({ port: "COM9" });

//memwatch.on('leak', function(info) { console.log("leaks: "+ info) });

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
      } else if (channel == 'faceValue') {
          console.log("Received faceValue:" + message);
          myFace = message;
      } else if (channel == 'textValue') {
          console.log("Received textValue:" + message);
          myText = message;
      } else if (channel == 'nameValue') {
          console.log("Received nameValue:" + message);
          myName = message;
      }
});


boardMEGA.on("ready", function() {
  clientPub.publish('webcamValue', myWebcamValue );
  console.log("connected to Arduino MEGA on COM12" + "/n" + "connected to " + myWebcamValue);
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
          song: "A B C D E F G G G G - G F E D C B A A A - A B C D E F G G G G - G F E D C B A A A",
          beats: 1 / 4,
          tempo: 100
        });
  }

  setInterval(function(){
    if (myLed == 1) {

        ledEyeR.on();
        ledEyeL.on();
        ledWebActivated.on();
        led.on();
        led.color(myRGB);
        led2.on();
        led2.color(myRGB);
    } else {
        led.off();
        ledEyeR.off();
        ledEyeL.off();
        ledWebActivated.off();

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
    //  console.log("myPot changed " + myPot);
      clientPub.publish('potValue', myPot );
    }
    myPot=myPotOld;

    if (myPhoto!=myPhotoOld) {
      clientPub.publish('photoValue', myPhoto );
    }
    myPhoto=myPhotoOld;
  }, 10000);  // change to something logical
} catch(e) {
    getDateTime();
    console.error(e);
}



});



boardLCD.on("ready", function() {
  console.log("connected to Arduino (LCD) on COM11");

  var p = new five.LCD({
    pins: [pinLCD1, pinLCD2, pinLCD3, pinLCD4, pinLCD5, pinLCD6],
    backlight: pinLCD7,
  });
  try {
    setInterval(function(){
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
    }, 1000);
  } catch(e) {
      getDateTime();
      console.error(e);
  }

});



boardTMP.on("ready", function() {
  console.log("connected to Arduino TMP on COM9");
  var ledTest = new five.Led.RGB({
    pins: {
      red: pin2R,
      green: pin2G,
      blue: pin2B
    }, board: boardTMP
  });
        ledTest.on();
        ledTest.color(myRGB);
});

function getDateTime() {

    var date = new Date();

    var hour = date.getHours();
    hour = (hour < 10 ? "0" : "") + hour;

    var min  = date.getMinutes();
    min = (min < 10 ? "0" : "") + min;

    var sec  = date.getSeconds();
    sec = (sec < 10 ? "0" : "") + sec;

    var year = date.getFullYear();

    var month = date.getMonth() + 1;
    month = (month < 10 ? "0" : "") + month;

    var day  = date.getDate();
    day = (day < 10 ? "0" : "") + day;

    return year + ":" + month + ":" + day + ":" + hour + ":" + min + ":" + sec;
}
