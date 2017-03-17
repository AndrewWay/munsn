
$(document).ready(function() {


	$(window).scroll(function(){
		
		
		
		if(($(".sidebars").offset().top + $(".sidebars").height()) < $("#calendar").height() || $(this).scrollTop() < $(".sidebars").offset().top ){ 
			$(".sidebars").css({
			
				'top': $(this).scrollTop() + 50 //Use it later
			
            
			});
		}
    });
	
});
