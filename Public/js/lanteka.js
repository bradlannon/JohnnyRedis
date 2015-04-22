io = io.connect();
io.emit('getInitialValues');

//receiving the socket connections

io.on('displayInitialValues', function(data) {
    $('#photoValue').html('Photoresistor: ' + data.photo);
    $('#potValue').html('Potentiometer: ' + data.pot);
    $('#pushValue').html('Push Button: ' + data.push);
    $('#pingValue').html('Ping Sensor: N/A');// + data.ping);
    $("#rgbValue").val(data.ledvalues);  // led color if on
    $("#ledValue").val(data.ledvalue);  //led button on or off
    $("#servoValue").val(data.servo);
    $("#lcdValue").val(data.lcd);

    if (data.ledvalue==1) {
        $("#ledValue").attr('checked', true);
    } else
    {
        $("#ledValue").attr('checked', false);
    }
   // console.log("ledvalue:" + data.ledvalue + ", ledValus:" + data.ledvalues)
});

io.on('displayReadOnlyData', function(data) {
    $('#photoValue').html('Photoresistor: ' + data.photo);
    $('#potValue').html('Potentiometer: ' + data.pot);
    $('#pushValue').html('Push Button: ' + data.push);
    $('#pingValue').html('Ping Sensor: ' + data.ping);
});

io.on('displayNewLEDStatus', function(myVal) {
    if (myVal==1) {
        $("#ledValue").prop('checked', true);
    } else
    {
        $("#ledValue").prop('checked', false);
    }
});

io.on('displayNewLED', function(myVal) {
    $("#rgbValue").val(myVal);
});

io.on('displayNewMotor', function(myVal) {
    $("#servoValue").val(myVal);
});

io.on('displayLcdText', function(myVal) {
    $("#lcdText").val(myVal);
});

// javascript events to send to socketio

$('#ledValue').change(
    function(){
        if (this.checked) {
            data = {myVal: 1};
            io.emit('changeLEDStatus', data);
        } else {
            data = {myVal: 0};
            io.emit('changeLEDStatus', data);
    }
});

$("#lcdText").keyup(function(event){
    if(event.keyCode == 13){
        data = {myVal:  $(this).val()};
        io.emit('changeLcdText', data);
    }
});

$("#lcdText").focusout(function(event){
    data = {myVal:  $(this).val()};
    console.log("lcd is " + data.myVal);
    io.emit('changeLcdText', data);
});

$("#lcdFace").change(function() {
    data = {myVal:  $(this).val()};
    io.emit('changeFace', data);
});

$("#servoValue").change(function() {
    data = {myVal:  $(this).val()};
    io.emit('changeMotor', data);
});

$("#rgbValue").change(function() {
    data = {myVal:  $(this).val()};
    io.emit('changeLEDValues', data);
});

$("#piezoValue").click(function() {
    //$('#result').empty();
    //$("input:radio").attr("checked", false);
      io.emit('playSong');
});

window.setInterval(function(){
//    console.log('talking every 5000 ms as getValues')
    io.emit('getValues');
}, 1000);


$('#webcamValue').change(
    function(){
        if (this.checked) {
           $('#myCanvas').show();

        } else {
        $('#myCanvas').hide();
    }
});


$('#robotValue').change(function(){
    if (this.checked) {
        var nameVal = $('#nameValue').val();
        if (nameVal.length >= 5) {
            enableButtons();
            console.log("ok to hide now");
        }
    }
});

$("#nameValue").keyup(function(event){
    var robotValue = 0;
    robValue = $('#robotValue').val();
    console.log("keyup");
    if(event.keyCode == 13){
        console.log("keycode 13   enter?");
        if ($("#nameValue").val().length >= 5 & robValue == 1) {
            enableButtons();
            console.log("ok to hide now");
        }
    }
});

$("#nameValue").focusout(function(event){
    console.log("focus out");
    var robValue = 0;
    robotValue = $('#robotValue').val();
    if ($("#nameValue").val().length >= 5 & robValue == 1) {
        enableButtons();
        console.log("ok to hide now");
    }
});

function enableButtons() {
    $('#rgbValue').prop('disabled', false);
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
    $('#rgbValue').prop('disabled', true);
    $('#servoValue').prop('disabled', true);
    $('#ledValue').prop('disabled', true);
    $('#textValue').prop('disabled', true);
    $('#faceValue').prop('disabled', true);
    $('#webcamValue').prop('disabled', true);
    $('#piezoValue').prop('disabled', true);
    $('#myCanvas').hide("slow");
}

window.onload = disableButtons;
