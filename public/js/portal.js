
$(document).ready(function(){
	$("#postBox #text").focus(function() {
	
		$("#postBox").animate({height: "110px"},200);
		$("#postBox #text").animate({height: "110px"},200);
	
	
	});
	
	$("#postBox #text").focusout(function() {
	
		$("#postBox").animate({height: "30px"},200);
		$("#postBox #text").animate({height: "30px"},200);
	
	
	});
});