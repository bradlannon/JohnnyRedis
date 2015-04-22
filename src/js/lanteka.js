io = io.connect();
io.emit('getInitialValues');

//receiving the socket connections

io.on('displayInitialValues', function(data) {
    $('#photoValue').html('Photoresistor: ' + data.photo);
    $('#potValue').html('Potentiometer: ' + data.pot);
    $('#pushValue').html('Push Button: ' + data.push);
    $('#pingValue').html('Ping Sensor: ' + data.ping);
   // $("#rgbValue").val(data.rgb);  
    $("#servoValue").val(data.servo);                              // good
    $("#textValue").val(data.mytext);
    $("#faceValue").val(data.face);

    if (data.led==1) {
        $("#ledValue").attr('checked', true);
    } else {
        $("#ledValue").attr('checked', false);
    }
});

io.on('displayReadOnlyValues', function(data) {
    $('#photoValue').html('Photoresistor: ' + data.photo);
    $('#potValue').html('Potentiometer: ' + data.pot);             // good
    $('#pushValue').html('Push Button: ' + data.push);
    $('#pingValue').html('Ping Sensor: ' + data.ping);
});

io.on('displayNewLED', function(myVal) {
    if (myVal==1) {
        $("#ledValue").prop('checked', true);                     // good
    } else
    {
        $("#ledValue").prop('checked', false);
    }
});

// io.on('displayNewRGB', function(myVal) {
//     console.log('displayNewRGB: ' + myVal);
//     $("#rgbValue").val(myVal);                                  // good
// });

io.on('displayNewFace', function(myVal) {                       // good
    $("#faceValue").val(myVal);
});

io.on('displayNewMotor', function(myVal) {
    $("#servoValue").val(myVal);                                // good
});

io.on('displayNewText', function(myVal) {                         // good
    $("#textValue").val(myVal);
});


//////////////// javascript events to send to socketio /////////////////////

$('#ledValue').change(
    function(){
        if (this.checked) {
            data = {myVal: 1};
            io.emit('ledValueChange', data);                 // good
        } else {
            data = {myVal: 0};
            io.emit('ledValueChange', data);
    }
});

$("#textValue").keyup(function(event){
    if(event.keyCode == 13){
        data = {myVal:  $(this).val()};                     // good
        io.emit('textValueChange', data);
    }
});

$("#textValue").focusout(function(event){
    data = {myVal:  $(this).val()};                        // good
    io.emit('textValueChange', data);
});

$("#faceValue").change(function() {
    data = {myVal:  $(this).val()};                        // good
    io.emit('faceValueChange', data);
});

$("#servoValue").change(function() {
    data = {myVal:  $(this).val()};                     // good
    io.emit('servoValueChange', data);
});

// $("#rgbValue").change(function() {
//     data = {myVal:  $(this).val()};                   // good
//     io.emit('rgbValueChange', data);
// });

$("#piezoValue").click(function() {
    //$('#result').empty();
    //$("input:radio").attr("checked", false);         // good
      io.emit('piezoValueChange');
});

$('#webcamValue').change(
    function(){
        if (this.checked) {
           $('#myCanvas').show();                           // ok
        } else {
        $('#myCanvas').hide();
    }
});

$('#robotValue').change(function(){
    if (this.checked) {
        var nameVal = $('#nameValue').val();                 // ok
        if (nameVal.length >= 5) {
            enableButtons();
            console.log("ok to hide now");
        }
    }
});

$("#nameValue").keyup(function(event){
    if(event.keyCode == 13){
        console.log("keycode 13   enter?");
        myNameValueChange();
    }
});

$("#nameValue").focusout(function(event){
   myNameValueChange();
});

function myNameValueChange() {
    var robValue = 0;
    var myIp = "0.0.0.0";
    robValue = $('#robotValue').val();
    if ($("#nameValue").val().length >= 5 & robValue == 1) {
        $.getJSON("http://smart-ip.net/geoip-json?callback=?", function(data){
            myIp = data.host;
        });
        enableButtons();
        data = {myVal:  $("#nameValue").val() + ":" + myIp};                   // good
        io.emit('nameValueChange', data);
    }
}

function enableButtons() {
  //  $('#rgbValue').prop('disabled', false);
    $('#servoValue').prop('disabled', false);
    $('#ledValue').prop('disabled', false);
    $('#textValue').prop('disabled', false);
    $('#piezoValue').prop('disabled', false);
    $('#webcamValue').prop('disabled', false);
    $('#isHuman').removeClass('blur');
    $('#confirmHuman').hide("slow");
    $('#nameValue').hide("slow");

    data = {myVal:  $('#nameValue').val()};
    io.emit('getName', data);

}

function disableButtons() {
   // $('#rgbValue').prop('disabled', true);
    $('#servoValue').prop('disabled', true);
    $('#ledValue').prop('disabled', true);
    $('#textValue').prop('disabled', true);
    $('#faceValue').prop('disabled', true);
    $('#webcamValue').prop('disabled', true);
    $('#piezoValue').prop('disabled', true);
    $('#myCanvas').hide("slow");
}

window.onload = disableButtons;

window.setInterval(function(){
    io.emit('getReadOnlyValues');                              // good
}, 1000);
