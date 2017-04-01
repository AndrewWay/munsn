
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
	 * Left sidebar create buttons
	 * 
	 * @params: null
	 * 
	 * Create functionaity for groups and courses
	 ***************************/

	 //Display create group popup.
	$('#createGroup').on('click',function () {
		//Disable screen scrowing when open.
		$('html, body').css({
    		overflow: 'hidden'
		});

		$('#groupPop').show();
	});

	//Display create course popup
	$('#createCourse').on('click',function() {
		//Disable screen scrolling when open.
		$('html, body').css({
    		overflow: 'hidden'
		});

		$('#coursePop').show();
	});

	//Close create group popup
	$('#gClose').click(function() {
		//Allow screen scrolling when closed.
		$('html, body').css({
    		overflow: 'auto'
		});

		$('#groupPop').hide();
	});

	//Close create course popup
	$('#cClose').click(function() {
		//Allow screen scrolling when closed.
		$('html, body').css({
    		overflow: 'auto'
		});

		$('#coursePop').hide();
	});


	//Create new group
	$('#gCreate').click(function() {
		$.post('/api/group', {
			name: $('#groupPop input[name="gName"]').val(),
			uid: uid
		})
		.done(function (result) {
					console.log(result);
		})
		.fail()
	});

	//Create new course
	$('#cCreate').click(function() {
		$.post('/api/course/', {
			name: $('#coursePop input[name="cName"]').val(),
			cid: uid
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

	//Load user profile image.
	//This could be done directly in page, but will cause an error if no session! 
	$('#userPic a img').attr('src', '/content/image/profile/session');

	//Load user groups
	//TODO: done, fail, callbacks
	$.get('/api/groups/user/session', function(response) {

		console.log(response);

		$.each( response.data , function(i,v) {
			$.get('/api/group/info/'+v._id, {
				gid: v._id
			}, function(response) {

			console.log(response)	
			$('#groupList').prepend('<li><a href="GROUP ID HERE"> GROUP NAME </a></li>');

			})
		
			//Each stops on false: Load maximum of 5 groups to sidebar.
			return i<5;

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