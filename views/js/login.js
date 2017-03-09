
$(function() {
            $( "#datePick" ).datepicker({changeMonth: true,
            changeYear: true, yearRange: "-100:+0"});
         });


$(document).ready(function(){
//When btn is clicked, convert to register page
$("#regBtn").click(function(){
	//Another option would be to animate the entire body changing background and changing z-index
	$("#obscure").fadeIn(500);
	$("#loginPanel").css("z-index","2");
	$("#loginFields").hide()
	
$("#loginPanel").animate({width: "400px", right: "-8%"}, 500, function(){$("#loginPanel").animate({height: "600px", top: "3%"}, 500, function(){$("#regFields").fadeIn(300)})}); //Testing is needed for this on many screen sizes



});


});