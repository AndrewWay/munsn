

$(document).ready(function () {

	/*****
	* NavBar Button functions
	*
	*@params: null
	*
	* Functionality of each navbar button onclick.
	*****/

	//Notification center functions when clicked.
	$("#not").click(function () {
		if ($("#not-center:visible").length == 0) {
			$("#not-center").fadeIn(200);
		} else {
			$("#not-center").fadeOut(200);
		}


	});

	$("#log").click(function () {
		//CALL LOGOUT from api. Not yet implemented.
	});

	$("#cog").click(function () {
		//GOTO: Settings
	});

/*******
 * Load left sidebar elements. 
 * 
 *@params: uid
 * 
 * 
 *******/

//Load user profile image

$('#userPic a img').attr('src', '/content/image/profile/session');


});




/****
 *Sidebar scrolling. Horizontally scroll, vertically fixed
 * 
 *@params: null 
 * 
 * Function on window scroll that keeps sidebars fixed vertically but allows them to be hidden horizontally.
 ****/

$(window).scroll(function () {

	if (($(".sidebars").offset().top + $(".sidebars").height()) < $(".timeline").height() || $(this).scrollTop() < $(".sidebars").offset().top) {
		$(".sidebars").css({

			'top': $(this).scrollTop() + 50 //Use it later


		});
	}
});