/*
* Used to keep sidebars in place when scrolling.
*
*/

$(document).ready(function(){
	
	$("#not").click(function(){
		if($("#not-center:visible").length == 0) {
			$("#not-center").fadeIn(200);	
		}
		else {
			$("#not-center").fadeOut(200);
		}
		
		
	});
	
	$("#log").click(function(){
		//CALL LOGOUT from api. Not yet implemented.
	});
	
	$("#cog").click(function(){
		//GOTO: Settings
	});
	
});



    $(window).scroll(function(){
		
		if(($(".sidebars").offset().top + $(".sidebars").height()) < $(".timeline").height() || $(this).scrollTop() < $(".sidebars").offset().top ){ 
			$(".sidebars").css({
			
				'top': $(this).scrollTop() + 50 //Use it later
			
            
			});
		}
    });


