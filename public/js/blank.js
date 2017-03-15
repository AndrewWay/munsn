/*
* Used to keep sidebars in place when scrolling.
*
*/



    $(window).scroll(function(){
		
		if(($(".sidebars").offset().top + $(".sidebars").height()) < $(".timeline").height() || $(this).scrollTop() < $(".sidebars").offset().top ){ 
			$(".sidebars").css({
			
				'top': $(this).scrollTop() + 50 //Use it later
			
            
			});
		}
    });


