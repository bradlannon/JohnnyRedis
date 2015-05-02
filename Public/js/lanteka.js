//  when do you need $(document).ready(function(){

// on load
$(function() {
    // jQuery for page scrolling feature - requires jQuery Easing plugin
    $('body').on('click', '.page-scroll a', function(event) {
        var $anchor = $(this);
        $('html, body').stop().animate({
            scrollTop: $($anchor.attr('href')).offset().top
        }, 1500, 'easeInOutExpo');
        event.preventDefault();
    });

    // Floating label headings for the contact form
    $("body").on("input propertychange", ".floating-label-form-group", function(e) {
        $(this).toggleClass("floating-label-form-group-with-value", !! $(e.target).val());
    }).on("focus", ".floating-label-form-group", function() {
        $(this).addClass("floating-label-form-group-with-focus");
    }).on("blur", ".floating-label-form-group", function() {
        $(this).removeClass("floating-label-form-group-with-focus");
    });

});

// Highlight the top nav as scrolling occurs
$('body').scrollspy({
    target: '.navbar-fixed-top'
});

// Closes the Responsive Menu on Menu Item Click
$('.navbar-collapse ul li a').click(function() {
    $('.navbar-toggle:visible').click();
});

//  Global variable myArduino used for rivets.js data binding
var myArduino = {
    photoValue : 0,
    potValue : 0,
    pushValue : 0,
    pingValue : 0,
    rgbValue : '#FF0000',
    servoValue : 0,
    motionValue : 0,
    textValue : 'hello world',
    faceValue :4,
    ledValue :1,
    robotValue : true,
    dontcheck1 : true,
    dontcheck2 : true,
    dontcheck3 : false,
    dontcheck4 : false,
    showArduino : false,
    changeServo : function() {
        data = {myVal:  myArduino.servoValue};
        io.emit('servoValueChange', data);
    },
    changeRgb : function() {
        data = {myVal:  myArduino.rgbValue};
        io.emit('rgbValueChange', data);
    },
    changePiezo : function() {
       io.emit('piezoValueChange');
    },
    changeFace : function() {
       data = {myVal:  myArduino.faceValue};
       io.emit('faceValueChange', data);
    },
    changeText : function() {
        console.log("sfdds");
        data = {myVal:  myArduino.textValue};
        io.emit('textValueChange', data);
    },
    changeLed : function() {
        console.log("sfdsf");
        return true;
    },
    changeLed2 : function() {
        console.log("fdsfa");
        data = {myVal: myArduino.ledValue};
        io.emit('ledValueChange', data);
    },
    changeLed3 : true,
    changeRobot : function() {
        if (document.getElementById("robotValue").value == 'on') {
            myArduino.myNameValueChange();
        }
    },
    changeWebcam : function()  {
        if (document.getElementById("webcamValue").value == 'on') {
            $('#myCanvas').show();
        } else {
            $('#myCanvas').hide();
        }
    },
    enableButtons : function() {
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
    },
    disableButtons : function() {
        $('#rgbValue').prop('disabled', true);
        $('#servoValue').prop('disabled', true);
        $('#ledValue').prop('disabled', true);
        $('#textValue').prop('disabled', true);
        $('#faceValue').prop('disabled', true);
        $('#webcamValue').prop('disabled', true);
        $('#piezoValue').prop('disabled', true);
        $('#myCanvas').hide("slow");
        $('#robotValue').prop('disabled', true);
        $('#name').prop('disabled', true);
        $('#email').prop('disabled', true);
        $('#phone').prop('disabled', true);
        $('#nameValue').prop('disabled', true);
        $('#message').prop('disabled', true);
        setTimeout(function() {
            $('#robotValue').prop('disabled', false);
            $('#nameValue').prop('disabled', false);
            $('#name').prop('disabled', false);
            $('#email').prop('disabled', false);
            $('#phone').prop('disabled', false);
            $('#message').prop('disabled', false);
        }, 5000);
    },
    myNameValueChange : function() {
        var robValue = $('#robotValue').attr('checked');
        var nameLength = $("#nameValue").val().length;
        if (nameLength >= 5 ) {
            myArduino.getInfoAndShow();
        }
    },
    showArduinoData : function() {
        myArduino.showArduino  = true;  //when user clicks on 'yes'
        myArduino.enableButtons();
    },
    hideArduinoData : function() {
        myArduino.showArduino  = false;  //when user clicks on 'yes'
        myArduino.disableButtons();
    },
    getInfoAndShow : function() {
       if ($('#robotValue').is(':checked')) {
            if(!$('#dontcheck1').is(':checked') & !$('#dontcheck2').is(':checked') & !$('#dontcheck3').is(':checked') & !$('#dontcheck4').is(':checked')) {
                $.getJSON("http://api.ipify.org?format=json", function(data){
                    var myIp = data.ip;
                    myArduino.enableButtons();
                    data = {myVal:  $("#nameValue").val() + ":" + myIp};
                    io.emit('nameValueChange', data);
                });
            }
        }
    }
};

var $elems = $('.animateblock');
var winheight = $(window).height();
var fullheight = $(document).height();

$(window).scroll(function(){
    animate_elems();
});

window.onload = myArduino.disableButtons();

window.view = rivets.bind($('#arduino'),{
    myArduino:myArduino
});

$("#nameValue").keyup(function(event){
    if(event.keyCode == 13){
        myArduino.myNameValueChange();
    }
});

$("#nameValue").focusout(function(event){
   myArduino.myNameValueChange();
});

// rivets.js binding code
rivets.formatters.chosen = function(value,selector) {
    $(selector).val(value).trigger('liszt:updated');
   // console.log($(selector));
   // console.log('gets called the amount of times the object is in the dom');
    return value;
};

// the socket connections
io = io.connect();
io.emit('getInitialValues');

io.on('displayInitialValues', function(data) {
    myArduino.photoValue = data.myPhoto;
    myArduino.potValue = data.myPot;
    myArduino.pushValue = data.myPush;
    myArduino.pingValue = data.myPing;
    myArduino.rgbValue = data.myRgb;
    myArduino.servoValue = data.myServo;
    myArduino.textValue = data.myText;
    myArduino.faceValue = data.myFace;
    myArduino.ledValue = data.myLed;
});

io.on('displayReadOnlyValues', function(data) {
    myArduino.photoValue = data.myPhoto;
    myArduino.potValue = data.myPot;
    myArduino.pushValue = data.myPush;
    myArduino.pingValue = data.myPing;
});

io.on('displayMotionValue', function(data) {
    myArduino.motionValue = data;
});

io.on('displayPushValue', function(data) {
    myArduino.pushValue = data;
});

io.on('displayPhotoValue', function(data) {
    myArduino.photoValue = data;
});

io.on('displayPingValue', function(data) {
    myArduino.pingValue = data;
});

io.on('displayPotValue', function(data) {
    myArduino.potValue = data;
});

io.on('displayToggleValue', function(data) {
    myArduino.toggleValue = data;
});

io.on('displayNewLED', function(myVal) {
    myArduino.ledValue = myVal;
});

io.on('displayNewRGB', function(myVal) {
     myArduino.rgbValue = myVal;
 });

io.on('displayNewFace', function(myVal) {
    myArduino.faceValue = myVal;
});

io.on('displayNewMotor', function(myVal) {
    myArduino.servoValue = myVal;
});

io.on('displayNewText', function(myVal) {
    myArduino.textValue = myVal;
});




function animate_elems() {
    wintop = $(window).scrollTop();
    $elems.each(function(){
      $elm = $(this);
      if($elm.hasClass('animated')) { return true; } // if already animated skip to the next item
      topcoords = $elm.offset().top; // element's distance from top of page in pixels
      if(wintop > (topcoords - (winheight * 0.75 ))) {
        // animate when top of the window is 3/4 above the element
        //
        // console.log(wintop);
        $elm.addClass('animated');
      }
    });
  }

// animates the responsive image when you click on  Responsive image link
var duration = 7000, steps = 3, step = 1;
setInterval( function() {
    document.querySelector( '.animation' ).setAttribute( 'data-animation-step', step = ++step > steps ? 1 : step );
}, duration / steps );
