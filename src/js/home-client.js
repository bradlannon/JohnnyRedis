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
    rosieRgbValue : '#FF0000',
    pingRgbValue : '#FF0000',
    servoValue : 0,
    motionValue : 0,
    textValue : '',
    faceValue :4,
    ledValue :1,
    lcdEyesValue :1,
    lcdEyeBrowsValue :1,
    onlineValue :0,                                          // 1 is allow online access, 0 is don't
    enableArduino : true,
    webcamValue : 'http://www.youtube.com/embed/i6x-5bQx91c',
    changeLed3 : true,
    changeServo : function() {
        data = {myVal:  myArduino.servoValue};
        io.emit('servoValueChange', data);
    },
    complete : function() {
        console.log("complete");
    },
    changeRgb : function() {
        data = {myVal:  myArduino.rgbValue};
        io.emit('rgbValueChange', data);
    },
    changeRosieRgb : function() {
        data = {myVal:  myArduino.rosieRgbValue};
        io.emit('rosieRgbValueChange', data);
    },
    changePingRgb : function() {
        data = {myVal:  myArduino.pingRgbValue};
        io.emit('pingRgbValueChange', data);
    },
    changeOnline : function() {
        data = {myVal:  myArduino.onlineValue};
        io.emit('onlineValueChange', data);
    },
    changePiezo : function() {
       io.emit('piezoValueChange');
    },
    changeFace : function() {
       data = {myVal:  myArduino.faceValue};
       io.emit('faceValueChange', data);
    },
    changeLCDEyes : function() {
       data = {myVal:  myArduino.lcdEyesValue};        // do this later
       io.emit('lcdEyesChange', data);
    },
    changeLCDEyeBrows : function() {
       data = {myVal:  myArduino.lcdEyeBrowsValue};         // do this later
       io.emit('lcdEyeBrowsChange', data);
    },
    changeWebcamLink : function() {
       data = {myVal:  myArduino.webcamValue};         // do this later
       io.emit('webcamChange', data);
    },

    changeText : function() {
        data = {myVal:  myArduino.textValue};
        io.emit('textValueChange', data);
    },
    changeLed : function() {
        data = {myVal:  myArduino.ledValue};
        io.emit('ledValueChange', data);
    },
    changeLedEyes : function() {
        data = {myVal:  myArduino.ledEyesValue};
        io.emit('ledEyesValueChange', data);
    }
};

// rivets.js binding code
rivets.formatters.chosen = function(value,selector) {
    $(selector).val(value).trigger('liszt:updated');
   // console.log($(selector));
   // console.log('gets called the amount of times the object is in the dom');
    return value;
};

// the socket.io connections

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

io.on('addNewUser', function(data) {
console.log("made it" + data);
  $("#usersOnline ul").append("<li>" + data + "</li>");
    var ul = document.getElementById("usersOnline");
    var li = document.createElement("li");
    li.appendChild(document.createTextNode(data + " Users Online"));
    // li.setAttribute("id","element4");
    ul.appendChild(li);
});

io.on('displayNewOnline', function(data) {
    console.log("new online made it" + data);
    myArduino.onlineValue = data;
});

io.on('displayNewServo', function(data) {
    console.log("new online made it" + data);
    myArduino.servoValue = data;
});


// check the io's below to see which ones are not used
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

io.on('newWebcamLink', function(data) {
    myArduino.webcamValue = data;
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

io.on('displayNewLEDEyes', function(myVal) {
    myArduino.ledEyesValue = myVal;
});

io.on('displayNewPingRGB', function(myVal) {
     myArduino.pingRgbValue = myVal;
 });

io.on('displayNewRosieRGB', function(myVal) {
     myArduino.rosieRgbValue = myVal;
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

var $elems = $('.animateblock');
var winheight = $(window).height();
var fullheight = $(document).height();

$(window).scroll(function(){
    animate_elems();
});

window.view = rivets.bind($('#page-top'),{
    myArduino:myArduino
});

window.onload = function() {
    $.getJSON('js/webcam.json', function(data){
        webcamArray = data.webcam[0]; //data.webcam.webcamValue;
        $('#webcamLinks').append('<li role="presentation"><a role="menuitem" tabindex="-1" href="#">'+data.webcam[0]+'</a></li>');
        $('#webcamLinks').append('<li role="presentation"><a role="menuitem" tabindex="-1" href="#">'+data.webcam[1]+'</a></li>');
        $('#webcamLinks').append('<li role="presentation"><a role="menuitem" tabindex="-1" href="#">'+data.webcam[2]+'</a></li>');
        // myArduino.webcamValue
    });
};

