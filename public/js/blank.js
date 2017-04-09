	var blankProm = [];
	/*****************
	 * Post Prepender
	 *
	 * Comm Prepender
	 *
	 * Animates Posts and Comments
	 *****************/
	var templates = {};
	var loaded = {
		users: {}
	};
	blankProm.push($.get("/api/user", function (result) {
		for (var k in result.data) {
			loaded.users[result.data[k]._id] = result.data[k];
		}
	}));
	blankProm.push($.get("/temps/commTemp.hjs", function (temp) {
		templates.commTemp = temp;
	}));
	blankProm.push($.get("/temps/postTemp.hjs", function (temp) {
		templates.postTemp = temp;
	}));
	blankProm.push($.get("/temps/lfTemp.hjs", function (temp) {
		templates.lfTemp = temp;
	}));
	var postFunctionality;
	blankProm.push(postFunctionality = function (postData, p_id, template) {
		var temp;
		if (template.indexOf('lfTemp') !== -1) {
			var temp = Hogan.compile(templates.lfTemp)
		} else if (template.indexOf('postTemp') !== -1) {
			var temp = Hogan.compile(templates.postTemp)
		}
		var output = temp.render(postData);
		$(output).hide().prependTo('#posts').fadeIn('slow');
		$("#clearPost").click();

		/****************
		 * Post button
		 *
		 * @params: pid
		 *
		 * Functionality for post edit and delete buttons
		 ****************/

		//Post delete button click functionality
		$('#' + p_id + ' .postDel').click(function () {
			var p_id = $(this).parents('.postTemp').attr('id');
			console.log("PID: " + p_id);
			$.ajax({
				method: 'DELETE',
				url: '/api/post',
				data: {
					pid: p_id
				}
			}).done(function () {
				$('#' + p_id).fadeOut('slow');
				$('#' + p_id + ' *').fadeOut('fast');
			}).fail(function () {

			});
		});

		//Post edit button click functionality
		$('#' + p_id + ' .postEdit').click(function () {
			var p_id = $(this).parents('.postTemp').attr('id');
			console.log("PID: " + p_id);
		});


		/******************
		 * Comment box expansion
		 *
		 * @params: pid
		 *
		 * Expand and shrink the comment box in a post
		 ******************/

		//Expand textarea and div on focus
		$('#' + p_id + ' .commBox *').focus(function () {

			//Box is the commBox of interest
			var box = $(this).parents('.commBox');

			box.animate({
				height: "110px"
			}, 200);
			$(".commText", box).animate({
				height: "70px"
			}, 200);
		});

		//Shrink textarea and div when focus is lost and there is no text inside.
		$('#' + p_id + ' .commBox *').focusout(function () {

			//Box is the commBox of interest
			var box = $(this).parents('.commBox');

			//Use a timeout to wait for focus to transfer to other children elements
			window.setTimeout(function () {
				//If there is no text in textarea, and a non child element of postBox was clicked: shrink.
				if (!$.trim($("*", box).val()) && $('*:focus', box).length == 0) {
					box.animate({
						height: "30px"
					}, 200);
					$(".commText", box).animate({
						height: "30px"
					}, 200);
				}
			}, 50);
		});

		/*********************
		 * Comment button
		 *
		 * @params: pid
		 *
		 * Functionality for comment buttons
		 *********************/

		//Comment clear button functionality
		$('#' + p_id + ' .commClear').click(function () {
			//TODO: Add warning: Check if sure.
			//Box is the commBox of interest
			var box = $(this).parents('.commBox');

			$(".commText", box).val(null);
			//$("#postProgress").empty(); TODO: John can deal with this. Idk enough about it
			box.animate({
				height: "30px"
			}, 200);
			$(".commText", box).animate({
				height: "30px"
			}, 200);
		});

		//Comment submit button functionality
		$('#' + p_id + ' .commSubmit').click(function () {
			//TODO: Add warning: Check if sure.
			//Box is the commBox of interest
			var box = $(this).parents('.commBox');
			//TODO: See if changing this p_id variable causes any errors.
			var p_id = box.parents('.postTemp').attr('id');

			//NOTE: As of now no comments have images. TODO: add images to comments.
			$.post('/api/comment', {
					pid: p_id,
					authorid: uid,
					data: {
						image: false,
						text: $('.commText', box).val(),
					}
				})
				.done(function (response) {
					console.log(response);
					commAppend(response.data, p_id);
				})
				.fail(function (response) {
					console.log(response);
				})

			$('.commClear', box).click();
		});
	});
	var postPrepend;
	blankProm.push(postPrepend = function (data, p_id, template) {
		var postProm = [];
		var postData = $.extend({}, data, data.history.slice(-1).pop());
		postData.date = new Date(postData.date).toLocaleString();
		if (loaded.users[data.uid]) {
			postData.fname = loaded.users[data.uid].fname;
			postData.lname = loaded.users[data.uid].lname;
		} else {
			postProm.push($.ajax({
				type: 'GET',
				url: '/api/user/' + data.uid
			}).done(function (res) {
				loaded.users[data.uid] = res.data;
				postData.fname = res.data.fname;
				postData.lname = res.data.lname;
			}));
		}
		postData.image = postData.image ? 'visibility:visible' : 'visibility:hidden';

		$.when.apply($, postProm).then(function () {
			postFunctionality(postData, p_id, template);
		});
	});
	var commFunctionality;
	blankProm.push(commFunctionality = function (commData, p_id) {

		var template = Hogan.compile(templates.commTemp);
		var output = template.render(commData);
		$(output).hide().appendTo('#' + p_id + ' .postComm .commContainer').fadeIn('slow');
		$('#' + p_id + ' .commDel').click(function () {
			var c_id = $(this).parents('.commTemp').attr('id');
			var p_id = $('#' + c_id).parents('.postTemp').attr('id');
			console.log("PID: " + p_id);
			$.ajax({
				method: 'DELETE',
				url: '/api/comment',
				data: {
					pid: p_id,
					cid: c_id
				}
			}).done(function () {
				$('#' + c_id).fadeOut('slow');
				$('#' + c_id + ' *').fadeOut('fast');
			}).fail(function () {

			});
		});

		//Comment edit button click functionality
		$('#' + p_id + ' .commEdit').click(function () {
			var c_id = $(this).parents('.commTemp').attr('id');
			console.log("CID: " + c_id);
		});

	});
	var commAppend;
	blankProm.push(commAppend = function (data, p_id) {
		var commProm = [];
		//Grab all the info
		var commData = $.extend({}, data, data.history.slice(-1).pop());
		//Get correct date format
		commData.date = new Date(commData.date).toLocaleString();

		//Get the appropriate username

		if (loaded.users[data.authorid]) {
			commData.fname = loaded.users[data.authorid].fname;
			commData.lname = loaded.users[data.authorid].lname;
		} else {
			commProm.push($.ajax({
				type: 'GET',
				url: '/api/user/' + data.authorid
			}).done(function (res) {
				loaded.users[data.authorid] = res.data;
				commData.fname = res.data.fname;
				commData.lname = res.data.lname;
			}));
		}

		$.when.apply($, commProm).then(function () {
			commFunctionality(commData, p_id);
		});
	});

	var suggOutput;
	var suggIter = 0;

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

	$(document).ready(function () {
		//Get variable and store it.
		uidProm.push($.get('/api/session')
			.done(function (response) {
				if (response.user === undefined) {
					console.log("ERROR: Session not found.");
				} else {
					uid = response.user._id;
					$('#userPic a').attr('href', '/profile#' + uid);
					$(document).trigger('uidReady');
				}
			})
			.fail(function (response) {
				console.log('ERROR: Request failed.');
			}));


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
				$('#searchRes').html('<img src="/img/ring-alt.gif" width="50" height="auto" style="display: block; margin: auto; margin-top: 10px; margin-bottom: 10px">');
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
								u.image = u.gender ? "/content/image/profile/" + u._id : u.image;
								u.image = u.creatorid && u.ownerid ? "/content/image/group/" + u._id : u.image;
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

			//Disable screen scrolling when open.
			window.oldScrollPos = $(window).scrollTop();

			$(window).on('scroll.scrolldisabler', function (event) {
				$(window).scrollTop(window.oldScrollPos);
				event.preventDefault();
			});

			$('#groupPop').show();
		});

		//Display create course popup
		$('#createCourse').on('click', function () {
			//Disable screen scrolling when open.

			window.oldScrollPos = $(window).scrollTop();

			$(window).on('scroll.scrolldisabler', function (event) {
				$(window).scrollTop(window.oldScrollPos);
				event.preventDefault();
			});
			$('#coursePop').show();
		});

		//Close create group popup
		$('#gClose').click(function () {
			//Allow screen scrolling when closed.
			$(window).off('scroll.scrolldisabler');

			$('#groupPop').hide();
		});

		//Close create course popup
		$('#cClose').click(function () {
			//Allow screen scrolling when closed.
			$(window).off('scroll.scrolldisabler');

			//Empty all inputs
			$('#coursePop *').val(null);
			$('#coursePop *').attr('checked', false)

			$('#coursePop').hide();
		});

		//Upload group image: On image click open hidden input.
		$("#grImgDisp").click(function () {
			$("#grImgUp").click();
		});

		//Update the image with the uploaded image.
		$("#grImgUp").change(function () {
			$("#grImgDisp").attr("src", window.URL.createObjectURL(this.files[0]));
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
					if (result.status === 'fail') {
						//If ajax request returns false: display error in console
						console.log("Oh no. Something bad happened to the group submission");
					} else {
						var picForm = new FormData();
						picForm.append("image", $("#grImgUp")[0].files[0]);
						//Send multipart/formdata with the image
						$.ajax({
							xhr: function () {
								var xhr = new window.XMLHttpRequest();
								xhr.upload.addEventListener("progress", function (evt) {
									if (evt.lengthComputable) {
										var percentComplete = evt.loaded / evt.total;
										percentComplete = parseInt(percentComplete * 100);
										$("#grImgProgress").progressbar({
											value: percentComplete
										});
										if (percentComplete === 100) {
											window.setTimeout(function () {
												location.reload();
											}, 1000);
										}
									}
								}, false);
								return xhr;
							},
							url: '/content/image/group/' + result.data._id, //Get :gid from the return.
							type: 'POST',
							data: picForm,
							cache: false,
							contentType: false,
							processData: false,
						}).done(function (data) {
							console.log("group img uploaded");
							//TODO: User feedback
						}).fail(function (data) {
							console.log("group img not uploaded");
						})
					}
				})
				.fail(function (result) {
					//TODO: Alert user when failed.
				})
		});

		//Details for the course.
		//days = [RRule.MO, RRule.TU, RRule.WE, RRule.TH, RRule.FR, RRule.SA, RRule.SU];
		days = [RRule.MO, RRule.TU, RRule.WE, RRule.TH, RRule.FR, RRule.SA, RRule.SU];

		semStart = {
			"Winter": "Jan. 1",
			"Spring": "May. 1",
			"Summer MI": "May 1",
			"Fall": "Sept. 1"
		}
		semEnd = {
			"Winter": "Apr. 30",
			"Spring": "Aug. 31",
			"Summer MI": "June 30",
			"Fall": "Dec. 31"
		}

		//Add new course
		$('#cAdd').click(function () {
			$.get('/api/course/', {
					name: $('#coursePop input[name="cName"]').val(),
					label: $('#coursePop input[name="cLabel"]').val(),
					location: $('#coursePop input[name="cLabel"]').val(),
					semester: $('#coursePop #semester').val(),
					year: $('#coursePop input[name="cYear"]').val()
				})
				.done(function (response) {
					//If it exists: Add user to course. Else: Create course.
					if (!(response.data.length == 0)) {
						//TODO: Add user to course.

						//Empty all inputs
						$('#coursePop *').val('');
						$('#coursePop *').attr('checked', false)

						$('#coursePop').hide();
					} else {
						var cDays = [];
						var rule;
						$('.cDays:checked').each(function (i, v) {
							cDays.push(days[this.value]);
						});
						rule = new RRule({
							freq: RRule.WEEKLY,
							byweekday: cDays,
							until: new Date($('#lastDay').val() + ' ' + '23:59:59Z').toISOString().substr(0, 19)
						});
						var evnt = {
							'start': {
								//This substr is not a mistake, the time zone gets janked without it.
								'dateTime': new Date($('#firstDay').val() + ' ' + $('#startTime').val() + 'Z').toISOString().substr(0, 19),
								'timeZone': 'America/St_Johns'
							},
							'end': {
								//This substr is not a mistake, the time zone gets janked without it.
								'dateTime': new Date($('#firstDay').val() + ' ' + $('#endTime').val() + 'Z').toISOString().substr(0, 19),
								'timeZone': 'America/St_Johns'
							},
							'recurrence': ['RRULE:' + rule.toString()],
							'summary': $('input[name="cDepartment"]').val() + " " + $('input[name="cNumber"]').val(),
							'description': 'Arbitrary Description'
						};
						//If course doesn't already exist, create it.
						$.post('/api/course/', {
								label: $('input[name="cDepartment"]').val() + " " + $('input[name="cNumber"]').val(),
								description: "TODO: Add descriptions",
								name: $('input[name="cName"]').val(),
								semester: $('#semester').val(),
								location: $('input[name="cRoom"]').val(),
								department: $('input[name="cDepartment"]').val(),
								year: $('input[name="cYear"]').val(),
								cid: uid,
								event: evnt
							})
							.done(function (response) {

								//Empty all inputs
								$('#coursePop *').val('');
								$('#coursePop *').attr('checked', false)
								$('#coursePop').hide();
							})
							.fail(function (response) {
								console.log(response);
							})
					}
				})
				.fail(function (response) {
					console.log(response)
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

		/***********************
		 * Timepicker for course add
		 *
		 * @params: null
		 *
		 * Creates timepicker for course times
		 ************************/

		//initialize end time
		$('#endTime').datetimepicker({
			datepicker: false,
			formatTime: 'H:i A',
			format: 'H:i:s',
			step: 30,
			useCurrent: false,
			defaultDate: new Date(new Date().toLocaleDateString())
		});

		//Intialize start time
		$('#startTime').datetimepicker({
			datepicker: false,
			formatTime: 'H:i A',
			format: 'H:i:s',
			step: 30,
			useCurrent: false,
			defaultDate: new Date(new Date().toLocaleDateString())
		});

		$('#firstDay').datepicker({
			datepicker: true,
			formatTime: 'MM/DD/YY'
		});
		$('#lastDay').datepicker({
			datepicker: true,
			format: 'MM/DD/YY'
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
		$('#friendButton').click(function () {
			$('#groupPan').hide();

			//Make sure div is empty
			$('#friendPan').html('');

			//Add loading gif and then show.
			$('#friendPan').html('<img src="/img/ring-alt.gif">');
			$('#friendPan').show();

			//API call to get friend requests
			$.get('/api/friend/received/' + uid, {
					uid: uid
				})
				.done(function (response) {

					//Remove loading gif. TODO: Check if this is better placed somewhere else.
					$('#friendPan').html('');

					//Setup variable to hold data for templates
					var data = {
						"list": []
					};

					//Make array to hold promises.
					var promises = [];

					$.each(response.data, function (i, v) {
						//Push gets to array so next function waits.
						promises.push($.get('/api/user/' + v.userid)
							.done(function (response) {
								var x = $.extend({}, response.data, {
									"title": "profile",
								})
								x.image = x.gender ? "/content/image/profile/" + x._id : x.image;
								data.list.push(x);
							})
							.fail());
					});

					$.when.apply($, promises).then(function () {
						//If no friend requests exist, skip rendering.
						if (!(data.list.length == 0)) {
							$.get("/temps/frireqTemp.hjs", function (result) {
								$('#friendPan').append("<h3> Friend Requests </h3>");
								var template = Hogan.compile("{{#list}}" + result + "{{/list}}");
								var output = template.render(data);
								$('#friendPan').append(output);
							});
						}


						//API call to get user friends
						$.get('/api/friends/' + uid)
							.done(function (response) {

								//Setup variable to hold data for templates
								var data = {
									"list": []
								};

								//Make array to hold promises.
								var promises = [];

								//Display friend title
								$('#friendPan').append("<h3> Friends </h3>");

								//For each friend in the friends array
								if (!(typeof response.data[0] == 'undefined')) {
									$.each(response.data[0].friends, function (j, u) {

										//Push gets to array so next function waits.
										promises.push($.get('/api/user/' + u)
											.done(function (response) {
												var x = $.extend({}, response.data, {
													"title": "profile"
												})
												x.image = x.gender ? "/content/image/profile/" + x._id : x.image;
												data.list.push(x);
											})
											.fail());
									})

									//Waits until all data is loaded then displays friend list.
									$.when.apply($, promises).then(function () {
										//If no friends exist, display sad face
										if (!(data.list.length == 0)) {
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
					});
				})
				.fail()
		});

		//Group button functionality when clicked.
		$('#groupButton').on('click', function () {
			//Hide other panels
			$('#friendPan').hide();

			//Make sure div is empty
			$('#groupPan').html('');

			//Add loading gif and then show.
			$('#groupPan').html('<img src="/img/ring-alt.gif">');
			$('#groupPan').show();


			$.get('/api/groups/user/' + uid)
				.done(function (response) {
					//Remove loading gif. TODO: Check if this is better placed somewhere else.
					$('#groupPan').html('');

					//Setup variable to hold data for templates
					var data = {
						"list": []
					};

					//Display friend title
					$('#groupPan').append("<h3> Groups </h3>");

					if (!(typeof response.data[0] == 'undefined')) {
						$.each(response.data, function (j, u) {

							//Push gets to array so next function waits.
							var x = $.extend({}, u, {
								"title": "group"
							})
							x.image = u.creatorid && u.ownerid ? "/content/image/group/" + u._id : u.image;
							data.list.push(x);
						})

						//If no friends exist, display sad face
						if (!(data.list.length == 0)) {
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
		$.when.apply($, uidProm).then(function () {
			$.get('/api/friend/suggest/' + uid)
				//TODO: Add done and fail callbacks
				.done(function (response) {

					//Setup variable to hold data for templates
					var data = {
						"list": []
					};

					//Make array to hold promises.
					var suggProm = [];
					if (response.data) {
						$.each(response.data, function (i, v) {
							//Push gets to array so next function waits.
							suggProm.push($.get('/api/user/' + v)
								.done(function (response) {
									var x = $.extend({}, response.data, {
										"title": "profile"
									})
									data.list.push(x);
								})
								.fail());
						});
					}
					$.when.apply($, suggProm).then(function () {
						if (!(data.list.length == 0)) {
							$.get("/temps/suggTemp.hjs", function (result) {
								var template = Hogan.compile("{{#list}}" + result + "{{/list}}");
								suggOutput = template.render(data);
								suggOutput = suggOutput.split('<!-- Split Here -->').slice(0, -1);
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
			if (suggIter > 0) {
				suggIter = suggIter - 1;
			} else {
				suggIter = suggOutput.length - 1;
			}

			//Render new suggested friend
			$('#section-right .content-1 #suggList').html('');
			$('#section-right .content-1 #suggList').append(suggOutput[suggIter]);

		});

		//When Next button is clicked move forwards through list of suggested friends.
		$('#suggNext').click(function () {
			//If suggIter is max: Move to first element. Else: add 1
			if (suggIter < suggOutput.length - 1) {
				suggIter = suggIter + 1;
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
			$('#mapHolder').css({
				'top': $(this).scrollTop()
			})
			$(".navbar").css({

				'top': $(this).scrollTop()

			})
		}


	});