var id = window.location.hash.substring(1);

window.onhashchange = function () {
	window.location.reload();
}

var postBoxMax = 140;
var imgBool = false;

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
			var x = $("#postBox *").val();
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

			$.each(response.data, function (i, v) {

				var postInfo = $.extend({}, v, v.history.slice(-1).pop());
				postInfo.date = new Date(postInfo.date).toLocaleString();

				$.ajax({
					type: 'GET',
					async: false,
					url: '/api/user/' + v.uid
				}).done(function (res) {
					postInfo.fname = res.data.fname;
					postInfo.lname = res.data.lname;
				});
				postInfo.image = postInfo.image ? 'visibility:visible' : 'visibility:hidden';
				data.list.push(postInfo);
				//Stop at 20 posts. Arbitrary
				return i < 20;
			});

			console.log(data);

			$.get("/temps/postTemp.hjs", function (post) {
				data.list.reverse();
				var template = Hogan.compile("{{#list}}" + post + "{{/list}}");
				var output = template.render(data);
				$('#posts').append(output);
			});
		})
		.fail(
			//TODO: Function on failures.
		);

	/************************
	 * Profile button functionality
	 * 
	 * @params: null
	 * 
	 * Functionality for each of the profile infoBox buttons
	 ************************/

	//When resume button is clicked go to resume page.
	$('#infoButton #resume').click(function () {
		window.location.href = "/resume#"+id;
	});

	//When addFriend is clicked, send a friend request
	$('#infoButton #addFriend').click(function() {
		$.post('/api/friend/request', {
			uid: uid,
			fid: id
		})
		.done( function(response) {
			console.log(response);
			//TODO: Add feedback! Popout or something!
		})
		.fail( function(response) {
			console.log(response);
		})
	});

	/*******************
	 * Load profile info
	 *
	 * @params: null
	 *
	 * Functions for loading relevant profile info
	 ********************/

	//TODO: Get and display posts based on their type (poll, photo, text)
	$.get('/api/user/' + id)
		.done(function (response) {
			response.data.dob = new Date(response.data.dob).toLocaleDateString();

			$.get("/temps/profInfo.hjs", function (info) {
				var template = Hogan.compile(info);
				var output = template.render(response.data);
				$('#infoContainer').prepend(output);
			});
		})
		.fail(
			//TODO: Function on failures.
		);
});