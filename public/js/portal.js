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
	
	//TODO: Move to it's own file to be called by all pages which need it.
	/*************************
	 * Suggested friends sidebar
	 * 
	 * @params: null
	 * 
	 * Functionality to grab and navigate suggested friends list.
	 *************************/
	
	 $.get('/api/friend/suggest/'+uid, {
		uid: uid,
		limit: 10
	 }, function(response) {
		//TODO: Store the response in some variable
	 })
	 //TODO: Add done and fail callbacks
	 .done(function(response) {
		 console.log(response);
	 })
	 .fail(function(response) {});

	//When Previous button is clicked move backwards through list of suggested friends.
	$('#suggPrev').click(function() {
		//TODO -- Implementation when integration is done
		
	
	});
	
	//When Next button is clicked move forwards through list of suggested friends.
	$('#suggNext').click(function() {
		//TODO -- Implementation when integration is done
		
	
	});
	
	


	//TODO: Move this to blank.js so it can be accessed on any page.
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