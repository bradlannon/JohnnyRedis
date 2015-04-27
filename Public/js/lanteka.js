var data = {
    title: 'Welcome to the Node',
  title2: 'still works',
    products: [
      {
        title: 'lollipop',
        price: 0.5
      },
      {
        title: 'teakettle',
        price: 14.95
      },
      {
        title: 'magic stick',
        price: 89.12546
      },
      {
        title: 'low rider',
        price: 22450
      },
      {
        title: 'champagne',
        price: 45
      }
    ]};
///////////////////////

io = io.connect();
io.emit('getInitialValues');

var myReadable = {photoValue:0,potValue:0,pushValue:0, motionValue:0, pingValue:0};
rivets.bind($('#myReadable'), {myReadable: myReadable});

var myWritable = {photoValue:0,potValue:0,pushValue:0, pingValue:0};
rivets.bind($('#myWritable'), {myReadable: myReadable});
var user = {name:'brad'};

//receiving the socket connections
//
io.on('displayInitialValues', function(data) {
    myReadable.photoValue = data.photo;
    myReadable.potValue = data.pot;
    myReadable.pushValue = data.push;
    myReadable.pingValue = data.ping;
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
    myReadable.photoValue = data.photo;
    myReadable.potValue = data.pot;
    myReadable.pushValue = data.push;
    myReadable.pingValue = data.ping;
});

io.on('displayMotionValue', function(data) {
    myReadable.motionValue = data;
});

io.on('displayPushValue', function(data) {
    myReadable.pushValue = data;
});

io.on('displayPhotoValue', function(data) {
    myReadable.photoValue = data;
});

io.on('displayPingValue', function(data) {
    myReadable.pingValue = data;
});

io.on('displayPotValue', function(data) {
    myReadable.potValue = data;
});

io.on('displayToggleValue', function(data) {
    myReadable.toggleValue = data;
});


// old socket connections
//
//



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

$("#sendEmail").click(function() {
    data = {senderName:  $(this).val(),
            senderEmail:  $(this).val(),
            senderPhone:  $(this).val(),
            senderMessage:  $(this).val()

        };
    io.emit('sendEmail');
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
        if(!$('#dontcheck1').is(':checked') & !$('#dontcheck2').is(':checked') & !$('#dontcheck3').is(':checked') & !$('#dontcheck4').is(':checked')) {
            $.getJSON("http://api.ipify.org?format=json", function(data){
                var myIp = data.ip;
                enableButtons();
                data = {myVal:  $("#nameValue").val() + ":" + myIp};
                io.emit('nameValueChange', data);
            });
        }
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


  var $elems = $('.animateblock');
  var winheight = $(window).height();
  var fullheight = $(document).height();

  $(window).scroll(function(){
    animate_elems();
  });


function animate_elems() {
    wintop = $(window).scrollTop(); // calculate distance from top of window

    // loop through each item to check when it animates
    $elems.each(function(){
      $elm = $(this);

      if($elm.hasClass('animated')) { return true; } // if already animated skip to the next item

      topcoords = $elm.offset().top; // element's distance from top of page in pixels

      if(wintop > (topcoords - (winheight * 0.75 ))) {
        // animate when top of the window is 3/4 above the element
        //
         console.log(wintop);
        $elm.addClass('animated');
      }
    });
  } // end animate_elems()





            // this thing is js driven on slid.es so I didn't bother switching out for css animations


 /* Every time the window is scrolled ... */
    // $(window).scroll( function(){

    //     /* Check the location of each desired element */
    //     $('.hideme').each( function(i){

    //         var bottom_of_object = $(this).offset().top + $(this).outerHeight();
    //         var top_of_object = $(this).offset().top;
    //         var bottom_of_window = $(window).scrollTop() + $(window).height();
    //         var top_of_window = $(window).scrollTop();

    //         console.log("bottom of object is: " + bottom_of_object + "\n top of object is: " + top_of_object + "\n bottom of window:" + bottom_of_window + "\n top of window:" + top_of_window + "\n ");
    //         /* If the object is completely visible in the window, fade it it */
    //         if( bottom_of_window > bottom_of_object ){

    //             $(this).animate({'opacity':'1'},500);

    //         }

    //         if( top_of_window < top_of_object ){

    //             $(this).animate({'opacity':'1'},500);

    //         }


    //     });

    // });

    // this thing is js driven on slid.es so I didn't bother switching out for css animations
            var duration = 7000, steps = 3, step = 1;
            setInterval( function() {
                document.querySelector( '.animation' ).setAttribute( 'data-animation-step', step = ++step > steps ? 1 : step );
            }, duration / steps );
