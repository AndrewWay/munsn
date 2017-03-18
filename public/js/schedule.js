
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
		events: [{
					title: 'All Day Event',
					start: '2017-03-01'
				},
				{
					title: 'Long Event',
					start: '2017-03-07',
					end: '2017-03-10'
				},
				{
					id: 999,
					title: 'Repeating Event',
					start: '2017-03-09T16:00:00'
				},
				{
					id: 999,
					title: 'Repeating Event',
					start: '2017-03-16T16:00:00'
				}] //Integrate with server.
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
