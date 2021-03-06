var refresh_int;
var stock_name; // name of the initial stock
var stock_ticker; // ticker of the initial stock
var first_stock; // historical data of first_stock
var dates; // dates of first stock's hist data

var first_html = ""; // html bar graph for stock 1
var second_html = ""; // same -> stock 2
var overlap_html = ""; // overlapping graph 
var vs_html = ""; // vs graph

$(document).ready(function() {
    
    $("#load").fadeIn(6000);
    $("#title").fadeIn(1000);
    $("#front h2").fadeIn(1500);
    $("#front form").fadeIn(2500);
    $("#submit").click(function(e) {

        e.preventDefault();
        clearInterval(refresh_int);

        var stock = $('#get_stock').val();
        // $(".sk-folding-cube").css("display", "block");
        if (stock == "") {
            $('#fail').html("<strong> ALERT: </strong>" + " Plz enter something in :(");
            $('#fail').css("display", 'block');
         } else {
        $.getJSON('/api/get_stock/' + stock, function(data) {
            if (data[0] == "failure") {
                console.log('failure');
                $('#fail').html("<strong> ALERT: </strong>" + stock + " is not a valid ticker");
                $('#fail').css("display", 'block');
            } else {
                $('#fail').css("display", 'none');

                // Emptying all the potential old stuff from the compare section
                $('#fail_2').css("display", 'none');
                $('#success').css("display", 'none');
                $('#switch').slideUp('slow');
                $('#stock_data').css("display", 'block');
                $('#get_compare').val(""); 

                // Set some values up...
                $('#name').html(data.name);
                stock_name = data.name;
                stock_ticker = stock.toUpperCase();
                $('#day_change').html(data.day_change);
                $('#pe').html("PE Ratio: " + data.pe);
                $('#eps').html("EPS: " + data.eps);
                console.log(data.pe);
                $('#data').empty();
                $('#current').html(data.current_price);
                var hist_data = data.historical_data;
                var keys = Object.keys(hist_data);
                keys.sort(function(a, b){
                    return new Date(b) - new Date(a);
                });
                first_stock = hist_data;
                dates = keys;
                for (var i = 0; i < keys.length - 1; i++) {
                    var last = hist_data[keys[i + 1]]['Close'];
                    var data = hist_data[keys[i]];
                    var change = get_percent(last, data['Close']);
                    var report = '<div class="bar" id="bar' + i + '"><div id="slide' + i + '" class="slider"><span class="tooltiptext">' + keys[i] + ': <br>' + data['Close'] + " (" + round_hund(change) + ')</span></div></div>';
                    $("#data").append(report);
                    
                    if (change < 0) {
                        $("#slide" + i).css({"background-color": "#ff4d4d", "width": percent_change(change) + "%", "left": 50 - percent_change(change) + "%"});
                        $("#slide" + i).addClass("red");
                        
                    } else {
                        $("#slide" + i).css({"background-color": "#47d147", "width": percent_change(change) + "%", "left": "50%"});
                        $("#slide" + i).addClass("green");

                    }
                    
                }
                first_html = grab_html("#data");

                $('html, body').animate({
                    scrollTop: $('#stock_data').offset().top
                }, 1933);
            }
        });
        }
        refresh_int = setInterval(update_price, 4000, stock);
    });

    $("#compare_listen").click(function(e) {
        console.log("yo");
        e.preventDefault();
        var stock_2 = $("#get_compare").val().toUpperCase();
        if (stock_2 == "") {
            $('#success').css("display", "none");
            $('#fail_2').html("<strong> ALERT: </strong>" + " Plz enter something in :(");
            $('#fail_2').css("display", 'block');
        } else {
        $.getJSON('/api/get_stock/' + stock_2, function(data) {
            if (data[0] == "failure") {
             $('#success').css("display", "none");
                $('#fail_2').html("<strong> ALERT: </strong>" + stock_2 + " is not a valid ticker");
                $('#fail_2').css("display", 'block');
            } else {
                console.log("what");
                var temp_html = $("<div id='data'>");
                $('#fail_2').css("display", "none");
                $('#success').html("Comparing <strong>" + stock_name + " (" + stock_ticker + ")</strong> and <strong>" + data.name + " (" + stock_2 + ")</strong>!");
                $('#success').css("display", 'block');
                var second_stock = data.historical_data;
                for (var i = 0; i < dates.length - 1; i++) {
                    var change_1_y = first_stock[dates[i + 1]]['Close'];
                    var change_1_t = first_stock[dates[i]]['Close'];
                    var change_1 = get_percent(change_1_y, change_1_t);

                    var change_2_y = second_stock[dates[i + 1]]['Close'];
                    var change_2_t = second_stock[dates[i]]['Close'];
                    var change_2 = get_percent(change_2_y, change_2_t);


                    $("#slide" + i + " .tooltiptext").html(dates[i] + ': <br>' + stock_ticker + ': (' + round_hund(change_1) +
                        ")<br> vs. <br>" + stock_2.toUpperCase() + ": (" + round_hund(change_2) + ")");
                    var diff = change_2 - change_1;
                    if (diff < 0) {
                        $("#slide" + i).css({"background-color": "#A87D08", "width": percent_change(diff) + "%", "left": 50 - percent_change(diff) + "%"});

                    } else {
                        $("#slide" + i).css({"background-color": "#A87D08", "width": percent_change(diff) + "%", "left": "50%"});
                    }
                    // grabbing 2 stock bar
                    var report = '<div class="bar" id="bar' + i + '"><div id="slide' + i + '" class="slider"><span class="tooltiptext">' + dates[i] + ': <br>' + change_2_t + " (" + round_hund(change_2) + ')</span></div></div>';
                    temp_html.append(report);
                    if (change_2 < 0) {
                        temp_html.find("#slide" + i).css({"background-color": "#ff4d4d", "width": percent_change(change_2) + "%", "left": 50 - percent_change(change_2) + "%"});
                    } else {
                        temp_html.find("#slide" + i).css({"background-color": "#47d147", "width": percent_change(change_2) + "%", "left": "50%"});

                    }                    

                }
                temp_html.append("</div>");
                second_html = grab_html(temp_html);
                 
                vs_html = grab_html($("#data"));
                $("#stock1").html("<h2> " + stock_ticker + "</h2>");
                $("#stock2").html("<h2> " + stock_2 + "</h2>");
                $("#switch").slideDown("slow")        
            }
        });
        }

    });

    $("#stock1").hover( 
        function() {
            stock_on1(); 
        }, 
        function() {
            stock_off();
        }
    );
    
       $("#stock2").hover( 
        function() {
            stock_on2();
        }, 
        function() {
            stock_off();        
        }
    );
    
    $("#stock1").click(function(e) {
        var clicked = $(this).data('clicked');
        if(clicked == undefined || clicked == false) {
            stock_on1();
            $(this).data('clicked', true);
            $(this).off('mouseleave');
            $(this).css("background-color", "#81ca81");
            // disable the other button
            $("#stock2").css("background-color", "#A8DBA8");
            $("#stock2").off('mouseenter');
            $("#stock2").off('mouseleave');
        } else {
            // button is deactivated, movement=free again
            $("#stock2").on('mouseenter', stock_on2);
            $("#stock2").on('mouseleave', stock_off);
            $("#stock1").on('mouseenter', stock_on1);
            $("#stock1").on('mouseleave', stock_off);

            
            $(this).on('mouseleave', stock_off);
            $(this).data('clicked', false);
            $(this).css("background-color", "#A8DBA8");
        }
    });

    $("#stock2").click(function(e) {
        var clicked = $(this).data('clicked');
        if(clicked == undefined || clicked == false) {

            stock_on2();
            $(this).data('clicked', true);
            $(this).off('mouseleave');
            $(this).css("background-color", "#81ca81");
            // button is deactivated, movement=free again
            $("#stock1").css("background-color", "#A8DBA8");
            $("#stock1").off('mouseenter');
            $("#stock1").off('mouseleave');
        } else {
            // enable the other button
            $("#stock1").on('mouseenter', stock_on1);
            $("#stock1").on('mouseleave', stock_off);
            $("#stock2").on('mouseenter', stock_on2);
            $("#stock2").on('mouseleave', stock_off);

            $(this).on('mouseleave', stock_off);
            $(this).data('clicked', false);
            $(this).css("background-color", "#A8DBA8");
        }
    });

    var links = jQuery('a[href^="#"]').add('a[href^="."]');
    $(links).on('click', function(event) {
        event.preventDefault();
        var dest = $(this).attr('href');
        $(dest).slideToggle("slow");
    });

});

var stock_off = function() {
    $("#data").html(vs_html);
};

var stock_on1 = function() {
    $("#data").html(first_html);
};


var stock_on2 = function() {
    $("#data").html(second_html);
};

function grab_html(element) {
    return $(element).clone().wrap('<p>').parent().html();
}

function update_price(stock) {
    $.getJSON('/api/get_stock/' + stock, function(data) {
        var current = $('#current').html();
        var day_change = $('#day_change').html();
        console.log("test" + current + " " + day_change);
        $('#current').html(data.current_price);
        $('#day_change').html(data.day_change);
        console.log(data.current_price + ' ' + data.day_change);
        console.log("HEY");
        var diff = data.current_price - current;

        if (diff > 0) {
            flash_color('#47d147');
        } else if (diff < 0) {
            flash_color('#ff4d4d');
        }
    });
}

function flash_color(color) {
    $('#current').css("background-color", color);
    setTimeout(flash_color, 500, '');
}

function get_percent(old, cur) {
    return ((cur - old) / old) * 100
}

// scales a percent to a pixel % width
function percent_change(percent) {
    //  from -5 (-50) to 5 (50)
    return Math.abs(percent * 5);
}

// returns a % rounded to the hund and with the appropriate +/- sign
function round_hund(num) {
    var num2 = (Math.round(num * 100.0) / 100.0).toFixed(2);
    if (num2 > 0) {
        var num2 = "+" + num2;
    }
    return num2 + "%";
}
