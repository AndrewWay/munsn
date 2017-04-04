
var suggOutput;
var suggIter=0;
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
			.fail();


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
	$.get('/api/post/', {
			visibility: 'public'
		})
		.done(function (response) {
			var data = {
				"list": []
			};

			$.each(response.data, function (i, v) {

				var postInfo = $.extend({}, v, v.history.slice(-1).pop());
				postInfo.date = new Date(postInfo.date).toLocaleString();

				console.log(data);
				$.ajax({
					type: 'GET',
					url: '/api/user/' + v.uid
				}).done(function (res) {
					postInfo.fname = res.data.fname;
					postInfo.lname = res.data.lname;
				});
				postInfo.image = postInfo.image ? 'visibility:visible' : 'visibility:hidden';
				data.list.push(postInfo);

				//Stop at 5 posts. Arbitrary
				return i < 4;
			});

			$.get("/temps/postTemp.hjs", function (post) {
				var template = Hogan.compile("{{#list}}" + post + "{{/list}}");
				var output = template.render(data);
				$('#posts').append(output);
			});
		})
		.fail(
			//TODO: Function on failures.
		);

});