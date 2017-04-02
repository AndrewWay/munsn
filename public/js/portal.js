$(document).ready(function () {
	
	/******************
	* Post box expansion.
	*
	*@params: null
	*
	* Functions for expanding and shrinking the post textarea depending on focus.
	******************/
	
	//Expand textarea and div on focus
	$("#postBox *").focus(function () {

		$("#postBox").animate({
			height: "140px"
		}, 200);
		$("#postBox #text").animate({
			height: "110px"
		}, 200);


	});

	//Shrink textarea and div when focus is lost and there is no text inside.
	$("#postBox *").focusout(function () {

		//Use a timeout to wait for focus to transfer to other children elements
		window.setTimeout( function() {
			//If there is no text in textarea, and a non child element of postBox was clicked: shrink.
			if(!$.trim($("#postBox #text").val()) && $('#postBox *:focus').length == 0 ){
				$("#postBox").animate({
					height: "30px"
				}, 200);
				$("#postBox #text").animate({
					height: "30px"
				}, 200);
			}
		}, 50);

	});
	
	//TODO: Move to it's own file to be called by all pages which need it.
	/*************************
	 * Suggested friends sidebar
	 * 
	 * @params: null
	 * 
	 * Functionality to grab and navigate suggested friends list.
	 *************************/
	
	 $.get('/api/friend/suggest/'+uid, function(response) {
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


	//TODO: Potentially move to it's own file to be accessed by every page that needs it.
	/*******************
	 * Load posts
	 * 
	 * @params: null
	 * 
	 * Functions for loading relevant posts into the page
	 ********************/

	 $.get('/api/post/', {
		 visibility: 'public'
	 })
	 .done( function(response) {
		 $.each( response, function( i, v) {
			
			$('#posts').append("TEST TEXT <br>");

			//Stop at 5 posts.
			return i<4;

		 });
	 })
	 .fail(
		 //TODO: Function on failures.
	 );

});