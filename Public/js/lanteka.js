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

io.on('displayLcd', function(myVal) {
    $("#lcdValue").val(myVal);
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

$("#lcdValue").keyup(function(event){
    if(event.keyCode == 13){
        data = {myVal:  $(this).val()};
        io.emit('changeLcd', data);
    }
});

$("#lcdValue").focusout(function(event){
    data = {myVal:  $(this).val()};
    console.log("lcd is " + data.myVal);
    io.emit('changeLcd', data);
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





$('#robotValue').change(
    function(){
    if (this.checked) {
        console.log("writable by human");
        enableButtons();
    }
});

$("#interName").keyup(function(event){
    if(event.keyCode == 13){
        data = {myVal:  $(this).val()};
        if (data.length > 2) {
        enableButtons();
            console.log("writable by human");
        }
    }
});

$("#inteName").focusout(function(event){
    data = {myVal:  $(this).val()};
    if (data.length > 2) {
        enableButtons();
        console.log("writable by human");
    }
});

function enableButtons() {
    console.log("enableButtons");
    $('#rgbValue').prop('disabled', false);
    $('#servoValue').prop('disabled', false);
    $('#ledValue').prop('disabled', false);
    $('#lcdValue').prop('disabled', false);
    $('#piezoValue').prop('disabled', false);
    $('#inteName').hide("slow");
    $('#robotValue').hide("slow");

};

function disableButtons() {
    console.log("disable buttons");
    $('#rgbValue').prop('disabled', true);
    $('#servoValue').prop('disabled', true);
    $('#ledValue').prop('disabled', true);
    $('#lcdValue').prop('disabled', true);
    $('#piezoValue').prop('disabled', true);
};

window.onload = disableButtons;
