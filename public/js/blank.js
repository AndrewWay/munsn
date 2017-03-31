

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

	//Other NavBar buttons handled in page.

	/**************************
	 * Left sidebar create
	 * 
	 * @params: null
	 * 
	 * Create functionaity for groups and courses
	 ***************************/

	 //Create a new group
	$('#createGroup').click(function () {
		//TODO: Create group
	});

	//Add a new course
	$('#createCourse').click(function() {
		//TODO: Create Course. Or should just bring you to something to select existing courses?
	});

	/**************************
	 * Left siderbar loader
	 * 
	 * @params: null
	 * 
	 * Loads left sidebar element
	 ***************************/

//Load user profile image
$('#userPic a img').attr('src', '/content/image/profile/session');

//Load user groups
$.get('/groups/find/session', function(response) {
	$.each( response, function(i,v) {

		$('#groupList').prepend('<li><a href="#"> GROUP NAME </a></li>');


		//TODO: Add html to add groups to sidebar

	});
});


//Load user courses
$.get('/course/find/session', function(response) {
	$.each( response, function(i,v) {

		$('#courseList').prepend('<li><a href="#"> CLASS NAME </a></li>');

		//TODO: Add html to add classes to sidebar

	});

});

//TODO: Any other elements of left sidebar?

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