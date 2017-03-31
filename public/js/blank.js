
/******************
 * Get uid for future use
 * 
 * @params: uid
 * 
 * Gets session user id from server and stores it.
 ******************/

//Define uid variable
var uid;

//Get variable and store it.
$.get('/api/session')
.done(function(response) {
	if(response.user===undefined) {
		console.log("ERROR: Session not found.");
	}
	else {
		uid = response.user._id;
	}
})
.fail(function(response) {
	console.log('ERROR: Request failed.');
});

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

	 //Display create group popup
	$('#createGroup').click(function () {
		$('#popGroup').show();
	});

	//Display create course popup
	$('#createCourse').click(function() {
		$('#popGroup').show();
	});

	//Close create group popup
	$('#gClose').click(function() {
		$('#popGroup').hide();
	});

	//Close create course popup
	$('#cClose').click(function() {
		$('#popCourse').hide();
	});

	//Create new group
	$('#gCreate').click(function() {
		$.post('/api/group', {
			name: $('#popGroup input[name="gName"]').val(),
			uid: a
		})
	});

	//Create new course
	$('#gCreate').click(function() {
		$.post('/api/group', {
			name: $('#popGroup input[name="cgName"]').val(),
			uid: a
		}, function() {

		})
		.done()
		.fail()
		
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
	$.get('/api/groups/user/session', function(response) {
		$.each( response, function(i,v) {

			$('#groupList').prepend('<li><a href="#"> GROUP NAME </a></li>');


			//TODO: Add html to add groups to sidebar

		});
	});


	//Load user courses
	$.get('/api/course/session', function(response) {
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