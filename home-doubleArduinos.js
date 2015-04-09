var five = require("johnny-five");

var ports = [
  { id: "A", port: "COM5" },
  { id: "B", port: "COM9" }
];

new five.Boards(ports).on("ready", function() {

  // Both "A" and "B" are initialized
  // (connected and available for communication)

  // |this| is an array-like object containing references
  // to each initialized board.
  this.each(function(board) {

    // Initialize an Led instance on pin 13 of
    // each initialized board and strobe it.
   console.log(board);
  });
});