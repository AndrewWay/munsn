$(document).ready(function () {
	
	/******************
	* Post box expansion.
	*
	*@params: null
	*
	* Functions for expanding and shrinking the post textarea depending on focus.
	******************/
	
	//Expand textarea and div on focus
	$("#postBox #text").focus(function () {

		$("#postBox").animate({
			height: "110px"
		}, 200);
		$("#postBox #text").animate({
			height: "110px"
		}, 200);


	});

	//Shrink textarea and div when focus is lost
	$("#postBox #text").focusout(function () {

		$("#postBox").animate({
			height: "30px"
		}, 200);
		$("#postBox #text").animate({
			height: "30px"
		}, 200);


	});
	
	/************************
	* Suggested friend buttons
	*
	*@params: null
	*
	* Behaviour of suggested friend box when a button is clicked.
	*
	*COMMENTS: Should be moved to something outside here so there is no repeated code.
	************************/
	
	//When Previous button is clicked move backwards through list of suggested friends.
	$('#suggPrev').click(function() {
		//TODO -- Implementation when integration is done
		
	
	});
	
	//When Next button is clicked move forwards through list of suggested friends.
	$('#suggNext').click(function() {
		//TODO -- Implementation when integration is done
		
	
	});
	
	/*************************
	* Chat popout
	*
	*@params: null
	*
	* Opens a chat box
	*************************/
	
	$('#chatButton').click(function() {
		$('#chatButton').hide();
		$('#chat').animate({height: "300px"},200);
	});
	
	$('#chatTop').click(function(){
		$('#chatButton').show();
		$('#chat').animate({height: "0px"},200);
	});
});