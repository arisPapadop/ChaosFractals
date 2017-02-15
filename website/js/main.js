$(window).load(function() {

    w3_close();
    isIndex = false;
    // CASES 
    if (document.location.href.match(/[^\/]+$/)[0].match("^index.html")) {

        isIndex = true;
        changeMenuAndNav();
        setSize();

        // Check if it is Safari and turn off skrollr if it is.
        var isSafari = navigator.vendor && navigator.vendor.indexOf('Apple') > -1 &&
                       navigator.userAgent && !navigator.userAgent.match('CriOS');

        // initialize skrollr
        if (!isSafari) {
            var s = skrollr.init({
                smoothScrolling: true
            });

        } else {
            $('.right').css({
                '-webkit-transform': 'translateX(-7%)',
                transform: 'translateX(-7%)',
            });
        }

    } else {

        changeMenuAndNav();
        setSize();

        if (document.location.href.match(/[^\/]+$/)[0].match("^verhulst.html")) {

            initialiseBifurcationZoom();
            initialiseBifurcation();
            initialisePopulation();
            initialiseCobweb();
                    
        } else if (document.location.href.match(/[^\/]+$/)[0].match("^mandelbrot.html")) {

            makeMandelbrot();
            $('.w3-btn').offset({ top: $('.w3-btn').offset().top, left: $("#MandelbrotCanvas").offset().left});

        } else {

            imageLoader();

            $('.w3-btn').bind("click",  function () {
                $('#imageLoader').click();
            });
            
        }
    }


    $(".se-pre-con").fadeOut(1000);
    $(".pageHeader").delay(750).fadeIn(1000);
    $("#homeHeader").delay(1000).fadeIn(2000);
    
    if ($(window).scrollTop() < 10) {
        $("#menu").delay(2500).fadeIn(100);
    } else {
        $("#menu").fadeIn(100);
    }

    $(window).scroll(function() {
        changeMenuAndNav();
    });

    $(window).resize(function() {
        setSize();
    });

});


$(document).on('click', '.option-accordion-nav', function(e) {
    e.preventDefault();
    var target = this.getAttribute('data-anchor-target');
    $('html, body').animate({
        scrollTop: ($(target).offset().top)
    }, 1200);
});

function changeMenuAndNav() {

    if (isIndex) {

        if ($(window).scrollTop() > $(window).height() - 40) {

            if (($(window).scrollTop() < $(window).height()*2.5 + 80) 
                || ($(window).scrollTop() > ($('.slide-3').offset().top + $('.slide-3').height()))) {
                $("#menu").css('color', '#2e3842');
            }
            else {
                $("#menu").css('color', '#f2f1ef');
            }

        } else {
            $("#menu").css('color', '#f2f1ef');
        }

    } else {

        $($('.chapter').get().reverse()).each(function() {

            var chapterNav = $('[data-anchor-target="#' + $(this).attr('id')+'"]');

            if ($(this).offset().top < ($(window).scrollTop() + $(window).height()*0.4)) {
                
                activateNav(chapterNav);
                return false;
            }
        })

        if ($(window).scrollTop() > $(window).height()*0.6 - 40) {
            $("#menu").css('color', '#2e3842');
        } else {
            $("#menu").css('color', '#f2f1ef');
        }
    }   
}

function setSize() {

    var $win = $(window);
        $winHeight = $win.height();
        $winWidth  = $win.width();
        $title     = $('.slide-1');
        $menu      = $('#menu');

        $concepts  = $('.slide-2');
        $intro     = $('.intro');

        $team       = $('.slide-3');
        $member     = $('.memberProfile');
        $proPicBox  = $('.memberProfilePicture');
        $proTextBox = $('.memberProfileTextBox');
        $proHeader  = $('.memberProfileTextHeader');
        $proText    = $('.memberProfileText');

        $approach     = $('.slide-4');
        $diagram      = $('.diagram');
        $approachText = $('#approachText');

        $articleTitle = $('.slide-5');

        $article      = $('.slide-6');

    tooSmall = ($winWidth < 900 && $winHeight < 500);

    if (tooSmall) {
        $winWidth =  900;
        $winHeight = 500;
    }

    if (isIndex) {

        // SLIDE 1
        // resize homeSlide
        $title.height($winHeight);

        // SLIDE 2
        // make sure the content is within the size of window
        $intro.css('min-height', $winHeight / 2);

        // SLIDE 3
        // make member introductions a third of the window height
        $member.css('height', $winHeight / 2.5);
        // make profilePicture into circle
        $proText.css('padding', '2%');
        // make the 'pic box' a circle of diameter dependant on the height or width of the page
        $proPicBox.css({
            'width':  Math.min($winWidth, $winHeight) / 3,
            'height': Math.min($winWidth, $winHeight) / 3,
        });

        // remember the size (length) of the picture
        $picLength = $proPicBox.width();

        $member.css({
            'margin-right':  $picLength * 0.9,
        });

        $proTextBox.css('left', $picLength*0.5);

        $('.right > .memberProfileTextBox > .memberProfileText').css({
                            'padding-right': $picLength*0.6,
                            'padding-left':  '2%',
                        });
        $('.right').find('h3').css('padding-right', $picLength*0.6);

        $('.memberProfile:not(.right)').find('.memberProfileText').css({
                            'padding-left': $picLength*0.7,
                            'padding-right':  '2%',
                        });
        $('.memberProfile:not(.right)').find('h3').css('padding-left', $picLength*0.7);

        // SLIDE 4
        $diagram.css({ 
            'height':    $winHeight + 'px',
        });


    } else {

        // TITLE
        $articleTitle.height($winHeight*0.6);
        $articleTitle.width($winWidth);

        // ASIDE
        if ($winWidth < 1225) {
          $article.css({
            'padding-left': '4em',
            'padding-right': '1em',
          });
        } else {
          $article.css('padding-left', '2.5em');
          $article.css('padding-right', '2.5em');
        }
    }
}

$(document).on('click','.option-accordion-nav', function(event) {
    event.preventDefault();
    var target = this.getAttribute('data-anchor-target');
    $('html, body').animate({
        scrollTop: $(target).offset().top
    }, 1000);
});

function activateNav(chapterNav) {
    $('.active').removeClass('active');
    chapterNav.addClass("active");
}

function w3_open() {
    $("main").css("marginLeft", $(".w3-sidenav").width());
    $(".w3-sidenav").fadeIn(200);
    $(".w3-opennav").fadeOut(200);
    $(".w3-sidenav").css("min-width", "15%");
    $(".aside").css("padding-left", "2rem");
    $(".right").css("padding-right", "+=2rem");
}

function w3_close() {
    $("main").css("marginLeft", "0%");
    $(".w3-sidenav").fadeOut(200);
    $(".w3-opennav").fadeIn(200);
    $(".aside").css("padding-left", "3rem");
    $(".right").css("padding-right", "-=2rem");
}