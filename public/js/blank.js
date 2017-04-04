var suggOutput;
var suggIter=0;

/******************
 * Get uid for future use
 *
 * @params: uid
 *
 * Gets session user id from server and stores it.
 ******************/

//Define uid variable
var uid;
var uidProm = [];

//Get variable and store it.
uidProm.push($.get('/api/session')
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
	}));

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
		if (!($.trim($('#searchbar').val()) === '')) {

			//Empty the previous search
			$('#searchRes').html('');

			//Add loading gif and then show.
			$('#searchRes').html('<img src="/img/ring-alt.gif" width="50" height="auto">');
			$('#searchRes').show();

			//API call for search
			$.get('/api/search/', {
					search: $('#searchbar').val()
				})
				.done(function (response) {

					//Titles list for Hogan templating purposes.
					var titles = {
						"users": "profile",						
						"groups": "group",
						"course": "group"
					}

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
						$.each(v, function (j, u) {
							u = $.extend({}, u, {
								"title": titles[i]
							});
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
				.fail(function (response) {
					console.log(response);
				})

		}
	});

	//If search is no longer the focus: close
	$(".search *").focusout(function () {

		//Use a timeout to wait for focus to transfer to other children elements
		window.setTimeout(function () {
			//If there is no text in textarea, and a non child element of search was clicked: clear.
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

	/********************
	 * Menu functions
	 * 
	 * @params: null
	 * 
	 * Functions for the upper left menu buttons.
	 ********************/

	 //Friend button functionality when clicked.
	$('#friendButton').click(function() {
		$('#groupPan').hide();

		//Make sure div is empty
		$('#friendPan').html('');

		//Add loading gif and then show.
		$('#friendPan').html('<img src="/img/ring-alt.gif">');
		$('#friendPan').show();

		//API call to get friend requests
		$.get('/api/friend/received/'+uid, {
			uid: uid
		})
		.done(function(response) {

			//Remove loading gif. TODO: Check if this is better placed somewhere else.
			$('#friendPan').html('');

			//Setup variable to hold data for templates
			var data = {
				"list": []
			};

			

			$.each(response.data, function(i, v) {
				v=$.extend({}, v, {"title" : "profile" });
				data.list.push(v);
			});

			//If no friend requests exist, skip rendering.
			if(!(data.list.length==0)) {
				$.get("/temps/frireqTemp.hjs", function (result) {
					$('#friendPan').append("<h3> Friend Requests </h3>");
					var template = Hogan.compile("{{#list}}" + result + "{{/list}}");
					var output = template.render(data);
					$('#friendPan').append(output);
				});
			}

			//API call to get user friends
			$.get('/api/friends/'+uid)
			.done(function(response){

				//Setup variable to hold data for templates
				var data = {
					"list": []
				};
				
				//Make array to hold promises.
				var promises = [];

				//Display friend title
				$('#friendPan').append("<h3> Friends </h3>");

				//For each friend in the friends array
				if(!(typeof response.data[0] == 'undefined')) {
					$.each(response.data[0].friends, function(j, u) {

						//Push gets to array so next function waits.
						promises.push($.get('/api/user/'+u)
						.done(function(response){
							var x=$.extend({},response.data,{"title" : "profile"})
							data.list.push(x);
						})
						.fail());
					})	

					//Waits until all data is loaded then displays friend list.
					$.when.apply($, promises).then(function(){	
						//If no friends exist, display sad face
						if(!(data.list.length==0)) {
							$.get("/temps/searchTemp.hjs", function (result) {
								var template = Hogan.compile("{{#list}}" + result + "{{/list}}");
								var output = template.render(data);
								$('#friendPan').append(output);
							});
					} 
					})
				} else {
					//Display no friends
					$('#friendPan').append("<h5> No friends to display =( </h5>");
				}	
				
			})
			.fail()
		})
		.fail()
	});

	//Group button functionality when clicked.
	$('#groupButton').on('click', function() {
		//Hide other panels
		$('#friendPan').hide();

		//Make sure div is empty
		$('#groupPan').html('');

		//Add loading gif and then show.
		$('#groupPan').html('<img src="/img/ring-alt.gif">');
		$('#groupPan').show();


			$.get('/api/groups/user/'+uid)
			.done(function(response){
				//Remove loading gif. TODO: Check if this is better placed somewhere else.
				$('#groupPan').html('');

				//Setup variable to hold data for templates
					var data = {
					"list": []
				};

				//Display friend title
				$('#groupPan').append("<h3> Groups </h3>");

				if(!(typeof response.data[0] == 'undefined')) {
					$.each(response.data, function(j, u) {

						//Push gets to array so next function waits.
						var x=$.extend({},u,{"title" : "group"})
						data.list.push(x);
						
					})	

					//If no friends exist, display sad face
					if(!(data.list.length==0)) {
						$.get("/temps/searchTemp.hjs", function (result) {
							var template = Hogan.compile("{{#list}}" + result + "{{/list}}");
							var output = template.render(data);
							$('#groupPan').append(output);
						});
					} 
					
			} else {
				//Display no groups
				$('#groupPan').append("<h5> No groups to display =( </h5>");
			}
		})
		.fail()
	});

	//If somewhere outside of the panel is clicked: Close the panel.
	$(".menu *").focusout(function () {
		//Use a timeout to wait for focus to transfer to other children elements
		window.setTimeout(function () {
			//If there is no text in textarea, and a non child element of friendPan was clicked: clear.
			if ($('.menu *:focus').length == 0) {
				$('#friendPan').hide();
				$('#friendPan').html('');
				$('#groupPan').hide();
				$('#groupPan').html('');
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

	 //Wait until uid is ready
	$.when.apply($, uidProm).then(function(){
		$.get('/api/friend/suggest/'+uid)
		//TODO: Add done and fail callbacks
		.done(function (response) {

			//Setup variable to hold data for templates
			var data = {
				"list": []
			};
			
			//Make array to hold promises.
			var suggProm = [];

			$.each(response.data, function(i,v) {
				//Push gets to array so next function waits.
				suggProm.push($.get('/api/user/'+v)
				.done(function(response){
					var x=$.extend({},response.data,{"title" : "profile"})
					data.list.push(x);
				})
				.fail());
			});

			$.when.apply($, suggProm).then(function(){	
				if(!(data.list.length==0)) {
					$.get("/temps/suggTemp.hjs", function (result) {
						var template = Hogan.compile("{{#list}}" + result + "{{/list}}");
						suggOutput = template.render(data);
						suggOutput = suggOutput.split('<!-- Split Here -->').slice(0,-1);
						$('#section-right .content-1 #suggList').append(suggOutput[suggIter]);
					});
				} 
			});
		})
		.fail(function (response) {});
	})

	//When Previous button is clicked move backwards through list of suggested friends.
	$('#suggPrev').click(function () {
		//If suggIter is 0: Move to last element. Else: subtract 1;
		if(suggIter > 0){
			suggIter= suggIter-1;
		} else {
			suggIter = suggOutput.length-1;
		}

		//Render new suggested friend
		$('#section-right .content-1 #suggList').html('');
		$('#section-right .content-1 #suggList').append(suggOutput[suggIter]);

	});

	//When Next button is clicked move forwards through list of suggested friends.
	$('#suggNext').click(function () {
		//If suggIter is max: Move to first element. Else: add 1
		if(suggIter < suggOutput.length-1){
			suggIter= suggIter+1;
		} else {
			suggIter = 0;
		}

		//Render new suggested friend
		$('#section-right .content-1 #suggList').html('');
		$('#section-right .content-1 #suggList').append(suggOutput[suggIter]);


	});




	//TODO: Move this to blank.js so it can be accessed on any page.
	/*************************
	 * Chat popout
	 *
	 *@params: null
	 *
	 * Opens a chat box
	 *************************/

	$('#chatButton').click(function () {
		$('#chatButton').hide();
		$('#chat').animate({
			height: "300px"
		}, 200);
	});

	$('#chatTop').click(function () {
		$('#chatButton').show();
		$('#chat').animate({
			height: "0px"
		}, 200);
	});
	

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