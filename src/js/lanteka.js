/*!
 * Start Bootstrap - Freelancer Bootstrap Theme (http://startbootstrap.com)
 * Code licensed under the Apache License v2.0.
 * For details, see http://www.apache.org/licenses/LICENSE-2.0.
 */

// jQuery for page scrolling feature - requires jQuery Easing plugin
$(function() {
    $('body').on('click', '.page-scroll a', function(event) {
        var $anchor = $(this);
        $('html, body').stop().animate({
            scrollTop: $($anchor.attr('href')).offset().top
        }, 1500, 'easeInOutExpo');
        event.preventDefault();
    });
});

// Floating label headings for the contact form
$(function() {
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

// rivvets.js initialization code
rivets.configure({
  prefix: 'rv',
  preloadData: true,
  rootInterface: '.',
  templateDelimiters: ['{', '}'],
  handler: function(target, event, binding) {
    this.call(target, event, binding.view.models);
  }
});

// rivets.js testing binding code
$(document).ready(function(){
    rivets.formatters.chosen = function(value,selector) {
        $(selector).val(value).trigger('liszt:updated');
        console.log($(selector));
        // console.log('gets called the amount of times the object is in the dom');
        return value;
    };
    window.view = rivets.bind($('#myWritable2'),{
        truck:{id:1,job_id:3},
        jobs:[
            {id:1,job_number:'thing1'},
            {id:2,job_number:'thing2'},
            {id:3,job_number:'thing3'},
            {id:4,job_number:'thing4'},
        ]
    });

    //$('#chosen-version').chosen();
});

// rivets.js actual code
var myReadable = {photoValue:0,potValue:0,pushValue:0, motionValue:0, pingValue:0};
rivets.bind($('#myReadable'), {myReadable: myReadable});

var myWritable = {photoValue:0,potValue:0,pushValue:0, pingValue:0};
rivets.bind($('#myWritable'), {myWritable: myWritable});
var user = {name:'brad'};

//receiving the socket connections
io = io.connect();
io.emit('getInitialValues');

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

// jquery events to socket.io server

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


// functions for enabling, hiding, locking
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
}

window.onload = disableButtons;

  var $elems = $('.animateblock');
  var winheight = $(window).height();
  var fullheight = $(document).height();

  $(window).scroll(function(){
    animate_elems();
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
         console.log(wintop);
        $elm.addClass('animated');
      }
    });
  }

// animates the responsive image when you click on  Responsive image link
var duration = 7000, steps = 3, step = 1;
setInterval( function() {
    document.querySelector( '.animation' ).setAttribute( 'data-animation-step', step = ++step > steps ? 1 : step );
}, duration / steps );
