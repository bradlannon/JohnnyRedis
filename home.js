//  ARDUINO PIN LAYOUT  
//  
//      ADD HERE
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
    pinPhotoresistor = "A0",
    pinButton = 50,
    pinR = 2,
    pinG = 3,
    pinB = 11,
    pinPotentiometer = "A1",
    pinMotion = 13,                  
    pinPiezo = 18,
    pinServo1 = 20,
    pinLedM = 53,                
    toggleManual = 1,
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
    myPiezo = 0,
    myLed = 1,
    myCredentials = require("./credentials.js"),
    boardLCD = new five.Board({ port: "COM5" }),
    boardMEGA = new five.Board({ port: "COM8" });

clientSub = redis.createClient(myCredentials.myPort, myCredentials.myDB);
clientSub.auth(myCredentials.myAuth);
clientPub = redis.createClient(myCredentials.myPort, myCredentials.myDB),
clientPub.auth(myCredentials.myAuth);

clientSub.subscribe("rgbValue");
clientSub.subscribe("ledValue");
clientSub.subscribe("servoValue");
clientSub.subscribe("piezoValue");
clientSub.subscribe("lcdValue");

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
      } else if (channel == 'piezoValue') {
          console.log("Received piezoValue:" + message);
          myPiezo = message;
      } else if (channel == 'lcdValue') {
          console.log("Received lcdValue:" + message);
          myLcd = message;
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

  var ledMotion = new five.Led({ pin: pinLedM, board: boardMEGA }),
    button = new five.Button({ pin: pinButton, board: boardMEGA }),
    piezo = new five.Piezo({ pin: pinPiezo, board:boardMEGA }),
    potentiometer = new five.Sensor({ pin: pinPotentiometer,freq: 250, board: boardMEGA });
    photoresistor = new five.Sensor({pin: pinPhotoresistor,freq: 250, board: boardMEGA });
    servo = new five.Servo({pin: pinServo1, type: "standard", board: boardMEGA });

  boardMEGA.repl.inject({
    pot: photoresistor,
    button: button,
    piezo: piezo,
    led: led,
    ledMotion: ledMotion,
    pot: potentiometer
  });

  ledMotion.on();

  button.on("down", function() {
    myPush = 2;
    clientPub.publish('pushValue', '2' ); 
    if (toggleManual == 1) {
        toggleManual = 2;
        clientPub.publish('toggleValue', '2' ); 
      }
      else {
        toggleManual = 1;
        clientPub.publish('toggleValue', '1' ); 
      }
  });

  button.on("hold", function() {
     myPush = 3;
     clientPub.publish('toggleValue', '3' ); 
  });

  button.on("up", function() {
    myPush = 1;
    clientPub.publish('pushValue', '1' ); 
  });

  potentiometer.on("data", function() {
    myPot  = this.value;
  });

  photoresistor.on("data", function() {
    myPhoto = this.value;
  });


  setInterval(function(){
    if (myLed == 1) {
        led.on();
        led.color(myRGB);
         // led.blink(1000);
    } else {
        led.off();
    }

    if (toggleManual == 1) {
      if (myPiezo == 1) {
        myPiezo = 0;
        piezo.play({
        song: "A B C D E F G G G G - G F E D C B A A A - A B C D E F G G G G - G F E D C B A A A",
        beats: 1 / 4,
        tempo: 100
      });
    }
        
    if (myServo == 0) {
         // servo.ccw(1);
      } else if (myServo == 1) {
         // servo.cw(0);
      } else if (myServo == 2) {
         // servo.cw(1);
      }
    }
    if (myPush == 1 && myLed == 1) {
      if (myPushOld > myPush) {
          led.stop();
        }
        //  led.on();
      } else if (myPush == 2 && myLed == 1) {
          if (myPushOld > myPush) {
            led.stop();
            led.on();
          }
            
          led.strobe(50);
      } else if (myPush == 3 & myLed == 1) {
          led.strobe(50);
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
  }, 60000);  // change to something logical

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
