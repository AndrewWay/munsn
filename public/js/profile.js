$(document).ready(function () {

	/**********************
	 * Postbox resizing
	 *
	 *@params: null
	 *
	 * Functions for resizing post box.
	 ***********************/

	//Postbox enlarges when focused.
	$("#postBox #text").focus(function () {

		$("#infoContainer").animate({
			height: "300px"
		}, 200);
		$("#postBox #text").animate({
			height: "110px"
		}, 200);


	});

	//Postbox shrinks when out of focus
	$("#postBox #text").focusout(function () {

		$("#infoContainer").animate({
			height: "220px"
		}, 200);
		$("#postBox #text").animate({
			height: "30px"
		}, 200);


	});

	/***********************
	 * Resume button
	 *
	 *@params: null
	 *
	 * Button linking to resume page.
	 ************************/

	//When button is clicked go to resume page.
	$('#infoButton #resume').click(function () {
		window.location.href = "/resume";
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
	$('#suggPrev').click(function () {
		//TODO -- Implementation when integration is done


	});

	//When Next button is clicked move forwards through list of suggested friends.
	$('#suggNext').click(function () {
		//TODO -- Implementation when integration is done


	});
});