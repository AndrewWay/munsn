var postBoxMax = 140;
var imgBool = false;

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
		$.post("/api/post/timeline", {
				uid: uid,
				type: "timeline",
				targetid: uid,
				visibility: $('#vis').val(),
				fields: {
					image: imgBool,
					text: $('#postBox #text').val(),
					location: undefined,
					poll: undefined
				}
			})
			.done(function (response) {
				var pid = response.data._id;
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
											window.setTimeout(function () {
												$("#clearPost").click();
												window.setTimeout(function () {
													location.reload();
												}, 1000);
											}, 1000);
										}
									}
								}, false);
								return xhr;
							},
							url: '/content/posts/' + pid + '/' + pid,
							type: 'post',
							data: picForm,
							cache: false,
							contentType: false,
							processData: false

						}).done(function (response) {
							console.log("image uploaded");

						}).fail(function (err) {
							$("#clearPost").click();
							$("#postBox *").focusout(); //<- I dont think this works
						})
						.always(function () {
							//Maybe we don't want to reload the page if something fails?
						})
				} else {
					//Maybe do something else here instead
				}
			})
			.fail();
	});

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
	$(document).on('uidReady', function () {
        $('#posts').html('<img src="/img/ring-alt.gif" width="50" height="auto" style="display: block; margin: auto; margin-top: 20%">');
		$.ajax({
				url: '/api/posts/portal',
				type: 'GET',
				contentType: 'application/json; charset=utf-8',
				dataType: 'json',
				data: {
					"uid": uid
				}
			}).done(function (response) {
				var postData = {
					"list": []
				};

				var postProm = [];

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
							$.ajax({
								type: 'GET',
								async: false,
								url: '/api/user/' + u.authorid
							}).done(function (res) {
								commInfo.fname = res.data.fname;
								commInfo.lname = res.data.lname;
							});

							commData.list.push(commInfo);
						});

    					$('#posts').html('');

						$.get("/temps/commTemp.hjs", function (commTemp) {
							var template = Hogan.compile("{{#list}}" + commTemp + "{{/list}}");
							var output = template.render(commData);
							postInfo.comments = output;
						});
					};

					postProm.push($.ajax({
						type: 'GET',
						url: '/api/user/' + v.uid
					}).done(function (res) {
						postInfo.fname = res.data.fname;
						postInfo.lname = res.data.lname;
					}))
					postInfo.image = postInfo.image ? 'visibility:visible' : 'visibility:hidden';

					postData.list.push(postInfo);

					//Stop at 5 posts. Arbitrary
					return i < 20;
				});

				//Wait until all data is loaded for the posts.
				$.when.apply($, postProm).then(function () {
					$.get("/temps/postTemp.hjs", function (post) {
						var template = Hogan.compile("{{#list}}" + post + "{{/list}}");
						var output = template.render(postData);
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
							var c_id = $(this).parents('.commTemp').attr('id');
							console.log("CID: " + c_id);
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
								})
								.fail(function (response) {
									console.log(response);
								})

							$(".commClear", box).click();
						});
					});
				});
			})
			.fail(
				//TODO: Function on failures.
			);
	});
});