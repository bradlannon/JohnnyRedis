io = io.connect();
io.emit('getInitialValues');

//receiving the socket connections

io.on('displayInitialValues', function(data) {
    $('#photoValue').html('Photoresistor: ' + data.photo);
    $('#potValue').html('Potentiometer: ' + data.pot);
    $('#pushValue').html('Push Button: ' + data.push);
    $('#pingValue').html('Ping Sensor: ' + data.ping);
    $("#rgbValue").val(data.rgb);
    $("#servoValue").val(data.servo);
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
    $('#potValue').html('Potentiometer: ' + data.pot);
    $('#pushValue').html('Push Button: ' + data.push);
    $('#pingValue').html('Ping Sensor: ' + data.ping);
});

io.on('displayNewLED', function(myVal) {
    if (myVal==1) {
        $("#ledValue").prop('checked', true);
    } else
    {
        $("#ledValue").prop('checked', false);
    }
});

 io.on('displayNewRGB', function(myVal) {
     $("#rgbValue").val(myVal);
 });

io.on('displayNewFace', function(myVal) {
    $("#faceValue").val(myVal);
});

io.on('displayNewMotor', function(myVal) {
    $("#servoValue").val(myVal);
});

io.on('displayNewText', function(myVal) {
    $("#textValue").val(myVal);
});


//////////////// javascript events to send to socketio /////////////////////

$('#ledValue').change(function(){
    if (this.checked) {
        data = {myVal: 1};
        io.emit('ledValueChange', data);
    } else {
        data = {myVal: 0};
        io.emit('ledValueChange', data);
    }
});

$("#textValue").keyup(function(event){
    if(event.keyCode == 13){
        data = {myVal:  $(this).val()};
        io.emit('textValueChange', data);
    }
});

$("#textValue").focusout(function(event){
    data = {myVal:  $(this).val()};
    io.emit('textValueChange', data);
});

$("#faceValue").change(function() {
    data = {myVal:  $(this).val()};
    io.emit('faceValueChange', data);
});

$("#servoValue").change(function() {
    data = {myVal:  $(this).val()};
    io.emit('servoValueChange', data);
});

 $("#rgbValue").change(function() {
    console.log("rgbValue is " + $("#rgbValue").val());
     data = {myVal:  $(this).val()};
     io.emit('rgbValueChange', data);
 });

$("#piezoValue").click(function() {
      io.emit('piezoValueChange');
});

$('#webcamValue').change(function(){
    if (this.checked) {
        $('#myCanvas').show();
    } else {
        $('#myCanvas').hide();
    }
});

$('#robotValue').change(function(){
    if (this.checked) {
        myNameValueChange();
    }
});

$("#nameValue").keyup(function(event){
    if(event.keyCode == 13){
        myNameValueChange();
    }
});

$("#nameValue").focusout(function(event){
   myNameValueChange();
});

  // setup node-inspect for fuck sakes!!!!
    //then research the camera

function myNameValueChange() {
    var robValue = $('#robotValue').attr('checked');
    var nameLength = $("#nameValue").val().length;
    if (nameLength >= 5 ) {
        getInfoAndShow();
    }
}

function getInfoAndShow() {
   if ($('#robotValue').is(':checked')) {
        $.getJSON("http://api.ipify.org?format=json", function(data){
            var myIp = data.ip;
            enableButtons();
            data = {myVal:  $("#nameValue").val() + ":" + myIp};
            io.emit('nameValueChange', data);
        });
    }
}

function enableButtons() {
    $('#rgbValue').prop('disabled', false);
    $('#servoValue').prop('disabled', false);
    $('#ledValue').prop('disabled', false);
    $('#textValue').prop('disabled', false);
    $('#piezoValue').prop('disabled', false);
    $('#webcamValue').prop('disabled', false);
    $('#faceValue').prop('disabled', false);
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

window.setInterval(function(){
    io.emit('getReadOnlyValues');
}, 1000);


