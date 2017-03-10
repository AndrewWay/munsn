
$(function() {
            $( "#datePick" ).datepicker({changeMonth: true,
            changeYear: true, yearRange: "-100:-16", defaultDate: "-16y-m-d"});
         });


$(document).ready(function(){
//When btn is clicked, convert to register page
$("#regBtn").click(function(){
	//Another option would be to animate the entire body changing background and changing z-index
	$("#obscure").fadeIn(500);
	$("#loginFields").hide()
	
	$("#loginPanel").animate({width: "400px", right: "-8%"}, 500, function(){$("#loginPanel").animate({height: "600px", top: "3%"}, 500, function(){$("#regFields").fadeIn(300)})}); //Testing is needed for this on many screen sizes

});

$("#closeReg").click(function(){
	//Another option would be to animate the entire body changing background and changing z-index

	$("#regFields").hide()
	
	$("#loginPanel").animate({width: "200px", right: "4%"}, 500, function(){$("#loginPanel").animate({height: "400px", top: "15%"}, 500, function(){$("#loginFields").fadeIn(300)})}); //Testing is needed for this on many screen sizes

	$("#obscure").fadeOut(500);

});

//For now this just shows functionality. Will have to see how integration will work with this.
$("#picUp").change(function(){
	$("#picDisp").attr("src", window.URL.createObjectURL(this.files[0]));
});


});