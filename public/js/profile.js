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

		$('#postBox *').val('');

		$("#imgDisp").attr("src", "#");
		$("#imgDisp").css({
			display: 'none'
		});

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

					$.ajax({
							url: '/content/posts/' + pid + '/' + pid,
							type: 'post',
							data: picForm,
							cache: false,
							contentType: false,
							processData: false

						}).done(function (response) {
							console.log("image uploaded");

						}).fail()
						.always(function () {
							//Clear the fields
							$("#clearPost").click();
						})
				} else {
					//Clear the fields
					$("#clearPost").click()
				}
			})
			.fail()
			.always(function () {
				location.reload();
			});
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
				data.list.push(postInfo);
				//Stop at 5 posts. Arbitrary
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

	//TODO: Potentially move to it's own file to be accessed by every page that needs it.
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
				$('#infoContainer').append(output);
			});
		})
		.fail(
			//TODO: Function on failures.
		);
});