
$(document).ready(function() {

    // page is now ready, initialize the calendar...

    $('#calendar').fullCalendar({
        header: {
				left: 'prev,next today',
				center: 'title',
				right: 'month,basicWeek,basicDay'
			},
		navLinks: true, // can click day/week names to navigate views
		editable: true,
		eventLimit: true, // allow "more" link when too many events
		events: [] //Integrate with server.
    });

	$(window).scroll(function(){
		
		console
		
		if(($(".sidebars").offset().top + $(".sidebars").height()) < $("#calendar").height() || $(this).scrollTop() < $(".sidebars").offset().top ){ 
			$(".sidebars").css({
			
				'top': $(this).scrollTop() + 50 //Use it later
			
            
			});
		}
    });
	
});
