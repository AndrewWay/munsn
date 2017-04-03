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
	.done(function (response) {
		if (response.user === undefined) {
			console.log("ERROR: Session not found.");
		} else {
			uid = response.user._id;
			$('#userPic a').attr('href', '/profile#' + uid);
		}
	})
	.fail(function (response) {
		console.log('ERROR: Request failed.');
	});

$(document).ready(function () {

	/******************
	 * Search
	 * 
	 * @params: null
	 * 
	 * Functionality for the search bar 
	 *******************/

	 //When search button is clicked: Search for values and display results
	$('#searchbtn').click(function () {

		//If search field is not only whitespace, send search call.
		if(!($.trim($('#searchbar').val())==='')) {

			//Empty the previous search
			$('#searchRes').html('');

			//Add loading gif and then show.
			$('#searchRes').html('<img src="/img/ring-alt.gif">');
			$('#searchRes').show();

			//API call for search
			$.get('/api/search/',{
				query: $('#searchbar').val()
			})
			.done(function(response) {

				//Titles list for Hogan templating purposes.
				var titles = { "groups" : "group", "users" : "profile", "course" : "group" }

				//Remove loading gif. TODO: Check if this is better placed somewhere else.
				$('#searchRes').html('');

				//Place all results in div.
				//Place elements separated by header elements.
				$.each(response.data, function (i, v) {

					//Setup variable to hold data for templates
					var data = {
						"list": []
					};

					//Each element of a specific type gets added to list.
					$.each(v, function(j,u) {
						u=$.extend({}, u, {"title" : titles[i] });
						data.list.push(u);
					})

					//TODO: Add an image and make all the search options pretty af.
					$.get("/temps/searchTemp.hjs", function (result) {
						$('#searchRes').append("<h3>" + i + "</h3>");
						var template = Hogan.compile("{{#list}}" + result + "{{/list}}");
						var output = template.render(data);
						$('#searchRes').append(output);
					});

				})


			})
			.fail(function(response) {
				console.log(response);
			})

		}
	});

	$(".search *").focusout(function () {

		//Use a timeout to wait for focus to transfer to other children elements
		window.setTimeout(function () {
			//If there is no text in textarea, and a non child element of postBox was clicked: shrink.
			if ($('.search *:focus').length == 0) {
				$('#searchbar').val('');
				$('#searchRes').hide();
				$('#searchRes').html('');
			}
		}, 50);

	});

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
	$('#createGroup').on('click', function () {
		//Disable screen scrowing when open.
		$('html, body').css({
			overflow: 'hidden'
		});

		$('#groupPop').show();
	});

	//Display create course popup
	$('#createCourse').on('click', function () {
		//Disable screen scrolling when open.
		$('html, body').css({
			overflow: 'hidden'
		});

		$('#coursePop').show();
	});

	//Close create group popup
	$('#gClose').click(function () {
		//Allow screen scrolling when closed.
		$('html, body').css({
			overflow: 'auto'
		});

		$('#groupPop').hide();
	});

	//Close create course popup
	$('#cClose').click(function () {
		//Allow screen scrolling when closed.
		$('html, body').css({
			overflow: 'auto'
		});

		$('#coursePop').hide();
	});


	//Create new group
	$('#gCreate').click(function () {
		$.post('/api/group', {
				name: $('#groupPop input[name="gName"]').val(),
				uid: uid
			})
			.done(function (result) {
				//Maybe add some functionality?
				$('#groupList').prepend('<li><a href="/group#' + result.data._id + '"> ' + result.data.name + ' </a></li>');
				$('#coursePop').hide();
			})
			.fail(function (result) {
				//TODO: Alert user when failed.
			})
	});

	//Add new course
	$('#cAdd').click(function () {
		$.post('/api/course/find', {
				name: $('#coursePop input[name="cName"]').val(),
				label: $('#coursePop input[name="cLabel"]').val(),
				location: $('#coursePop input[name="cLabel"]').val(),
				semester: $('#coursePop #semester').val(),
				year: $('#coursePop input[name="cYear"]').val()
			})
			.done(function (response) {

			})
			.fail(function (response) {

			})

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
	$.get('/api/groups/user/session', function (response) {

		$.each(response.data, function (i, v) {
			$('#groupList').prepend('<li><a href="/group#' + v._id + '"> ' + v.name + ' </a></li>');

			//Each stops on false: Load maximum of 5 groups to sidebar.
			return i < 4;

		});
	});


	//Load user courses
	$.get('/api/course/session', function (response) {
		if (response.data) {
			$.each(response.data, function (i, v) {

				$('#courseList').prepend('<li><a href="/group#' + v._id + '"> ' + v.name + ' </a></li>');

				//Each stops on false: Load maximum of 5 courses to sidebar.
				return i < 4;

			});
		}
	});

	//TODO: Any other elements of left sidebar?

});




/****
 *Sidebar and navbar scrolling. Horizontally scroll, vertically fixed
 *
 *@params: null
 *
 * Function on window scroll that keeps sidebars and navbar fixed vertically but allows them to be hidden horizontally.
 ****/

$(window).scroll(function () {

	if (($(".sidebars").offset().top + $(".sidebars").height()) < $(".timeline").height() || $(this).scrollTop() < $(".sidebars").offset().top) {
		$(".sidebars").css({

			'top': $(this).scrollTop() + 50 //Use it later

		});

		$(".navbar").css({

			'top': $(this).scrollTop()

		})
	}


});