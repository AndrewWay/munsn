/*
* Used to keep sidebars in place when scrolling.
*
*/



    $(window).scroll(function(){
        $(".sidebars").css({
            'top': $(this).scrollTop() //Use it later
        });
    });


