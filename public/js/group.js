var id = window.location.hash.substring(1);

window.onhashchange = function () {
	window.location.reload();
}

var postBoxMax = 140;
var imgBool = false;
var cid;

$(document).ready(function () {

	/**********************
	 * Postbox resizing
	 *
	 *@params: null
	 *
	 * Functions for resizing post box.
	 ***********************/

	//Expand textarea and div on focus
	$("#postBox *").focus(function () {

		$("#postBox").animate({
			height: postBoxMax + "px"
		}, 200);
		$("#postBox #text").animate({
			height: "110px"
		}, 200);


	});

	//Shrink textarea and div when focus is lost and there is no text inside.
	$("#postBox *").focusout(function () {

		//Use a timeout to wait for focus to transfer to other children elements
		window.setTimeout(function () {
			//If there is no text in textarea, and a non child element of postBox was clicked: shrink.
			if (!$.trim($("#postBox *").val()) && $('#postBox *:focus').length == 0) {
				$("#postBox").animate({
					height: "30px"
				}, 200);
				$("#postBox #text").animate({
					height: "30px"
				}, 200);
			}
		}, 50);

	});

	/****************************
	 * Making post
	 *
	 * @params: null
	 *
	 * Making posts to portal timeline. Posts stored to user timeline.
	 ****************************/

	//Button Functionality

	//Adding a picture to a post
	$('#photoPost').click(function () {
		$('#newPostImg').click();
	});

	//Update the input file field.
	$("#newPostImg").change(function () {
		postBoxMax = postBoxMax + 60;
		imgBool = true;

		console.log(imgBool);

		$("#imgDisp").attr("src", window.URL.createObjectURL(this.files[0]));

		$("#imgDisp").css({
			display: 'block'
		});

		$("#postBox").animate({
			height: postBoxMax + "px"
		}, 200);
	});

	//Adding a poll to a post
	$('#pollPost').click(function () {
		//TODO: Add api call for posts. Probably build div to create it.
	});

	//Clearing a post
	$('#clearPost').click(function () {
		//TODO: Add warning: Check if sure.
		postBoxMax = 140;
		imgBool = false;

		$("#postBox #text").val('');
		$("#postProgress").empty();
		$("#imgDisp").attr("src", "#");
		$("#imgDisp").css({
			display: 'none'
		});
		$('#vis').val('public');
		$("#postBox").animate({
			height: postBoxMax + "px"
		}, 200);
	});

	//Submit the post through api call
	$('#postSubmit').click(function () {
		//Send API call
		$.post("/api/post/group", {
				uid: uid,
				type: "group",
				targetid: id,
				visibility: $('#vis').val(),
				fields: {
					image: imgBool,
					text: $('#postBox #text').val(),
					location: undefined,
					poll: undefined
				}
			})
			.done(function (response) {
				var res = response.data;
				var p_id = res._id;


				//If image is supplied. Store that image.
				//TODO: Figure out why done et al aren't firing. Reload timeline with new post!
				if (imgBool) {
					var picForm = new FormData();
					picForm.append("image", $("#newPostImg")[0].files[0]);
					$("#postBox").animate({
						height: (postBoxMax + 50) + "px"
					}, 200);
					$.ajax({
						xhr: function () {
							var xhr = new window.XMLHttpRequest();
							xhr.upload.addEventListener("progress", function (evt) {
								if (evt.lengthComputable) {
									var percentComplete = evt.loaded / evt.total;
									percentComplete = parseInt(percentComplete * 100);
									$("#postProgress").progressbar({
										value: percentComplete
									});
									if (percentComplete === 100) {

									}
								}
							}, false);
							return xhr;
						},
						url: '/content/posts/' + p_id + '/' + p_id,
						type: 'post',
						data: picForm,
						cache: false,
						contentType: false,
						processData: false

					}).done(function (response) {
						console.log("image uploaded");
						$.when.apply($, blankProm).then(function () {
							postPrepend(res, p_id, "/temps/postTemp.hjs");
						});
					}).fail(function () {
						$("#clearPost").click();
						$("#postBox *").focusout(); //<- I dont think this works
					});
				} else {
					$.when.apply($, blankProm).then(function () {
						postPrepend(response.data, p_id, "/temps/postTemp.hjs");
					});
				}
			})
			.fail();
	});

	//TODO: Potentially move to it's own file to be accessed by every page that needs it.
	/*******************
	 * Load posts
	 *
	 * @params: null
	 *
	 * Functions for loading relevant posts into the page
	 ********************/

	//Get and display a number of posts.
	//TODO: Get and display posts based on their type (poll, photo, text)
	$.get('/api/post', {
			visibility: 'public',
			targetid: id
		})
		.done(function (response) {
			var data = {
				"list": []
			};

			var postProm = [];
			var commProm = [];

			$.each(response.data, function (i, v) {

				var postInfo = $.extend({}, v, v.history.slice(-1).pop());
				postInfo.date = new Date(postInfo.date).toLocaleString();

				//Grab all the comments, get the appropriate data and render them
				if (!(typeof v.comments === 'undefined')) {
					var commData = {
						"list": []
					};
					$.each(v.comments, function (j, u) {
						//Grab all the info
						var commInfo = $.extend({}, u, u.history.slice(-1).pop());
						//Get correct date format
						commInfo.date = new Date(commInfo.date).toLocaleString();

						//Get the appropriate username
						commProm.push($.ajax({
							type: 'GET',
							url: '/api/user/' + u.authorid
						}).done(function (res) {
							commInfo.fname = res.data.fname;
							commInfo.lname = res.data.lname;
						}));

						commData.list.push(commInfo);
					});

					$.when.apply($, postProm).then(function () {
						$.get("/temps/commTemp.hjs", function (commTemp) {
							var template = Hogan.compile("{{#list}}" + commTemp + "{{/list}}");
							var output = template.render(commData);
							postInfo.comments = output;
						});
					});
				};

				postProm.push($.ajax({
					type: 'GET',
					url: '/api/user/' + v.uid
				}).done(function (res) {
					postInfo.fname = res.data.fname;
					postInfo.lname = res.data.lname;
				}));
				postInfo.image = postInfo.image ? 'visibility:visible' : 'visibility:hidden';
				data.list.push(postInfo);
				console.log(data);
				//Stop at 5 posts. Arbitrary
				return i < 20;
			});

			$.when.apply($, commProm).then(function () {
				$.when.apply($, postProm).then(function () {
					$.get("/temps/postTemp.hjs", function (post) {
						data.list.reverse();
						var template = Hogan.compile("{{#list}}" + post + "{{/list}}");
						var output = template.render(data);
						$('#posts').append(output);

						/****************
						 * Post button
						 *
						 * @params: pid
						 *
						 * Functionality for post edit and delete buttons
						 ****************/

						//Post delete button click functionality
						$('.postDel').click(function () {
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
						$('.postEdit').click(function () {
							var p_id = $(this).parents('.postTemp').attr('id');
							console.log("PID: " + p_id);
						});

						/****************
						 * Comment button
						 *
						 * @params: pid
						 *
						 * Functionality for post edit and delete buttons
						 ****************/

						//Comment delete button click functionality
						$('.commDel').click(function () {
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
						$('.commEdit').click(function () {
							var p_id = $(this).parents('.commTemp').attr('id');
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
						$(".commBox *").focus(function () {

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
						$(".commBox *").focusout(function () {

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
						$('.commClear').click(function () {
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
						$('.commSubmit').click(function () {
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
									$.when.apply($, blankProm).then(function () {
										commAppend(response.data, p_id);
									});
								})
								.fail(function (response) {
									console.log(response);
								})

							$(".commClear", box).click();
						});
					});
				});
			});
		})
		.fail(
			//TODO: Function on failures.
		);

	//TODO: Potentially move to it's own file to be accessed by every page that needs it.
	/*******************
	 * Load group info
	 *
	 * @params: null
	 *
	 * Functions for loading relevant group info
	 ********************/

	//Get and display group info
	//TODO: Add findGroupById in API. It's missing for some reason.
	var groupProm = $.get('/api/group/' + id)
		.done(function (response) {
			cid = response.data.creatorid;
			response.data.created = new Date(response.data.created).toLocaleDateString();

			$.get('/api/user/' + response.data.creatorid)
				.done(function (res) {
					response.data.fname = res.data.fname;
					response.data.lname = res.data.lname;

					$.get("/temps/groupInfo.hjs", function (info) {
						var template = Hogan.compile(info);
						var output = template.render(response.data);
						$('#infoContainer').prepend(output);
					});
				});
		})
		.fail(
			//TODO: Function on failures.
		)

	/*************
	 * Button display
	 *
	 * @params: uid
	 *
	 * Display button based on user privilege
	 ************/

	//Wait for uid to be grabbed first
	$.when($, uidProm, groupProm).then(function () {
		//If not your profile: show otherPr buttons. Else: show yourPr buttons.
		if (!(uid == cid)) {
			$('#infoButton .notCr').show();
		} else {
			$('#infoButton .groupCr').show();
		}
	});

	/*************
	 * Profile button
	 *
	 * @params: id
	 *
	 * Profile button functionality
	 **************/

	//Member button functionality when clicked.
	$('#grMembers').click(function () {
		$('.grPopup').hide();

		//Make sure div is empty
		$('#grMembersPU').html('');

		//Add loading gif and then show.
		$('#grMembersPU').html('<img src="/img/ring-alt.gif">');
		$('#grMembersPU').show();

		//API call to get group members
		$.get('/api//groups/members/' + id)
			.done(function (response) {

				//Setup variable to hold data for templates
				var data = {
					"list": []
				};

				//Make array to hold promises.
				var promises = [];

				//Remove loading gif. TODO: Check if this is better placed somewhere else.
				$('#grMembersPU').html('');

				//Display friend title
				$('#grMembersPU').append("<h3> Members </h3>");

				//For each friend in the friends array
				if (!(typeof response.data[0] == 'undefined')) {
					$.each(response.data[0].members, function (i, v) {

						//Push gets to array so next function waits.
						promises.push($.get('/api/user/' + v.user)
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
								$('#grMembersPU').append(output);
							});
						}
					})
				} else {
					//Display no members
					$('#grMembersPU').append("<h5> No members to display =( </h5>");
				}
			})
			.fail()
	});

	//Get group requests for admin/creator
	$('#grRequest').click(function () {
		$('.grPopup').hide();

		//Make sure div is empty
		$('#grRequestPU').html('');

		//Add loading gif and then show.
		$('#grRequestPU').html('<img src="/img/ring-alt.gif">');
		$('#grRequestPU').show();

		//API call to get group requests
		$.get('/api/groups/requests/' + id)
			.done(function (response) {
				//Setup variable to hold data for templates
				var data = {
					"list": []
				};

				//Make array to hold promises.
				var promises = [];

				//Remove loading gif. TODO: Check if this is better placed somewhere else.
				$('#grRequestPU').html('');

				//Display friend title
				$('#grRequestPU').append("<h3> Requests </h3>");

				//For each friend in the friends array
				if (!(typeof response.data[0] == 'undefined')) {
					$.each(response.data[0].requests, function (i, v) {

						//Push gets to array so next function waits.
						promises.push($.get('/api/user/' + v)
							.done(function (response) {
								var x = $.extend({}, response.data, {
									"title": "profile",
									"gid": id
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
							$.get("/temps/grreqTemp.hjs", function (result) {
								var template = Hogan.compile("{{#list}}" + result + "{{/list}}");
								var output = template.render(data);
								$('#grRequestPU').append(output);
							});
						}
					})
				} else {
					//Display no friends
					$('#grRequestPU').append("<h5> No requests to display =( </h5>");
				}
			})
			.fail()
	});

	//If somewhere outside of the panel is clicked: Close the panel.
	$("#infoButton *").focusout(function () {
		//Use a timeout to wait for focus to transfer to other children elements
		window.setTimeout(function () {
			//If there are no elements focused: close the panel
			if ($('#infoButton *:focus').length == 0) {
				$('.prPopup').hide();
				$('.prPopup').html('');
			}
		}, 50);

	});
});