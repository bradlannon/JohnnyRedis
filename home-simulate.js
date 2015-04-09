//  FOR TESTING PURPOSES WITHOUT ARDUINO  
//  
//     THIS WILL SIMULATE THE ARDUINO AND SEND THE
//     DATA TO REDIS (such as the arduino home.js would do)
//
var myIncrement = 0,
    myIncrementMax40 = 0,
    myIncrementMax1 = 0,
    redis = require('redis'),
    myChoice =1,
    myCredentials = require("./credentials.js");

clientPub = redis.createClient(myCredentials.myPort, myCredentials.myDB),
clientPub.auth(myCredentials.myAuth, function() {
  console.log("Connected to Redis Pub Successfully!");
});

// clientSub = redis.createClient(myCredentials.myPort, myCredentials.myDB),
// clientSub.auth(myCredentials.myAuth, function() {
//   console.log("Connected to Redis Sub Successfully!");
// });

// clientSub.get("toggleValue", function (err, reply) {
//         console.log("toggle: " + reply); // Will print `OK`
//     });

setInterval(function(){
    myIncrement++;
	myIncrementMax40++;
	myIncrementMax1++;
	//clientPub.publish("lcdValue", 4);
	clientPub.publish("motionValue", myIncrementMax40);
	clientPub.publish("pushValue", myIncrementMax40 % 20);
	clientPub.publish("toggleValue", myIncrementMax1);
	clientPub.publish("photoValue",myIncrement);
	clientPub.publish("potValue", myIncrementMax40 * 2);

      if (myIncrementMax40==40) {
			myIncrementMax40=0;
      }

      if (myIncrementMax1==2) {
			myIncrementMax1=0;
      }
      console.log("increment " + myIncrementMax1);
  }, 1000);
