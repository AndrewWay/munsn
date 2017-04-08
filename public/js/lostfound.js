var lfType = 'lost';

$(document).ready(function () {

	/******************
	 * Map functions
	 *
	 * @params: null
	 *
	 * Functions used to display and use locationPicker map.
	 *******************/

	//Display or hide the map.
	$('.mapToggle').click(function () {
		if (Number($('#mapHolder').css("width").replace('px', '')) >= 545) {
			$("#mapHolder").animate({
				width: "0px"
			}, 200);
		} else {
			$("#mapHolder").animate({
				width: "550px"
			}, 200);
		}
	});

	//Initialize the map and set input fields.
	$('#map').locationpicker({
		location: {
			latitude: 47.5738,
			longitude: -52.7329
		},
		radius: 0,
		zoom: 15,
		inputBinding: {
			latitudeInput: $('#lat'),
			longitudeInput: $('#long'),
			locationNameInput: $('.locate')

		},
		enableAutocomplete: true
	});

	/**********************
	 * Lost/Found selector functions
	 *
	 * @params: null
	 *
	 * Functions used to display the correct fields in the right sidebar
	 ***********************/

	//Display lost fields if lost is clicked.
	$('#lostChoice').click(function () {
		if ($('#lostContent').css("display") === "none") {
			lfType = 'lost';
			$('#foundChoice').css({
				boxShadow: "none"
			});
			$('#lostChoice').css({
				boxShadow: "1px 1px 5px #555 inset"
			});
			$('#foundContent').toggle();
			$('#lostContent').toggle();
		} else {
			//Do nothing.
		}
	});

	//Display found fields if found is clicked.
	$('#foundChoice').click(function () {
		if ($('#foundContent').css("display") === "none") {
			lfType = 'found';
			$('#lostChoice').css({
				boxShadow: "none"
			});
			$('#foundChoice').css({
				boxShadow: "1px 1px 5px #555 inset"
			});
			$('#lostContent').toggle();
			$('#foundContent').toggle();
		} else {
			//Do nothing.
		}
	});

	/**************
	 *Image upload functions
	 *
	 *@params: null
	 *
	 *Allows user to upload image by clicking on image. After upload, update this field with new image.
	 **************/

	//Display hidden input file field when image is clicked.
	$('#lostImgDisp').click(function () {
		$('#lostImg').click();
	});


	//Update the image with the uploaded image.
	$("#lostImg").change(function () {
		$("#lostImgDisp").attr("src", window.URL.createObjectURL(this.files[0]));
	});

	/****************
	 *Expanding description box
	 *
	 *@params: null
	 *
	 *Expands and contracts the description box as it comes in and out of focus.
	 ****************/

	//Expand box when focused.
	$(".textDesc .text").focus(function () {


		$(".textDesc").animate({
			height: "100px"
		}, 200);
		$(".textDesc .text").animate({
			height: "100px"
		}, 200);


	});

	//Shrink box when unfocused.
	$(".textDesc .text").focusout(function () {

		$(".textDesc").animate({
			height: "30px"
		}, 200);
		$(".textDesc .text").animate({
			height: "30px"
		}, 200);


	});

	$("#submitLost").click(function () {
		//Read in information from lost and found div
		var jReq = {
			uid: uid,
			type: 'lostfound',
			targetid: lfType,
			visibility: 'public',
			fields: {
				image: true,
				text: $('#' + lfType + 'Content textarea').val(),
				location: {
					lat: Number($('#' + lfType + 'Content input[name="lat"]').val()),
					lng: Number($('#' + lfType + 'Content input[name="long"]').val()),
					addr: $('#' + lfType + 'Content input[name="locate"]').val()
				},
				contact: {
					name: $('#' + lfType + 'Content input[name="name"]').val(),
					phone: $('#' + lfType + 'Content input[name="phone"]').val(),
					email: $('#' + lfType + 'Content input[name="email"]').val()
				}
			}
		};
		var jqxhr = $.post("/api/lostfound", jReq,
				function () {
					console.log("post");
				}
			)
			.done(function (response) {
				var res = response.data;
				var p_id = res._id;
				console.log(response.status);
				if (response.status === 'fail') {
					//If ajax request returns false: display error in console
					console.log("Oh no. Something bad happened");
				} else {
					var picForm = new FormData();
					picForm.append("image", $("#" + lfType + "Img")[0].files[0]);
					//Send multipart/formdata with the image
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
						url: '/content/posts/' + p_id + '/' + p_id, //Get :lostfoundid from the return.
						type: 'post',
						data: picForm,
						cache: false,
						contentType: false,
						processData: false,
					}).done(function (data) {
						console.log("img uploaded");
						$.when.apply($, blankProm).then(function () {
							postPrepend(res, p_id, "/temps/lfTemp.hjs");
						});
					}).fail(function (data) {
						console.log("img not uploaded");
					})
				}
				$("#" + lfType + "Content").val('');
				$.when.apply($, blankProm).then(function () {
					postPrepend(res, p_id, "/temps/lfTemp.hjs");
				});
			})
			.fail(function (response) {
				console.log(response);
			})
	});

	$("#submitFound").click(function () {
		//Read in information from lost and found div
		var jReq = {
			uid: uid,
			type: lfType,
			targetid: 'none',
			visibility: 'public',
			fields: {
				image: true,
				text: $('#' + lfType + 'Content textarea').val(),
				location: {
					lat: Number($('#' + lfType + 'Content input[name="lat"]').val()),
					lng: Number($('#' + lfType + 'Content input[name="long"]').val()),
					addr: $('#' + lfType + 'Content input[name="locate"]').val()
				},
				contact: {
					name: $('#' + lfType + 'Content input[name="name"]').val(),
					phone: $('#' + lfType + 'Content input[name="phone"]').val(),
					email: $('#' + lfType + 'Content input[name="email"]').val()
				}
			}
		};
		var jqxhr = $.post("/api/lostfound", jReq,
				function () {
					console.log("post");
				}
			)
			.done(function (result) {
				var res = response.data;
				var p_id = res._id;
				console.log(result.status);
				if (result.status === 'fail') {
					//If ajax request returns false: display error in console
					console.log("Oh no. Something bad happened");
				} else {
					var picForm = new FormData();
					picForm.append("image", $("#" + lfType + "Img")[0].files[0]);
					//Send multipart/formdata with the image
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
						url: '/content/posts/' + p_id + '/' + p_id, //Get :lostfoundid from the return.
						type: 'post',
						data: picForm,
						cache: false,
						contentType: false,
						processData: false,
					}).done(function (data) {
						console.log("img uploaded");
						$.when.apply($, blankProm).then(function () {
							postPrepend(res, p_id, "/temps/lfTemp.hjs");
						});
					}).fail(function (data) {
						console.log("img not uploaded");
					})
				}
				$("#" + lfType + "Content").val('');
				$.when.apply($, blankProm).then(function () {
					postPrepend(res, p_id, "/temps/lfTemp.hjs");
				});
			})
			.fail(function (response) {
				console.log(response);
			})

	});
	$('#posts').html('<img src="/img/ring-alt.gif" width="50" height="auto" style="display: block; margin: auto; margin-top: 20%">');
	$(document).on('uidReady', function () {
		$.ajax({
				url: '/api/lostfound',
				type: 'GET',
				contentType: 'application/json; charset=utf-8',
				dataType: 'json',
				data: {
					type: 'lostfound'
				}
			}).done(function (response) {
				var postData = {
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

						$.when.apply($, commProm).then(function () {
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
					}))
					postInfo.image = postInfo.image ? 'visibility:visible' : 'visibility:hidden';

					postData.list.push(postInfo);

					//Stop at 5 posts. Arbitrary
					return i < 20;
				});


				//Wait until all data is loaded for the posts.
				$.when.apply($, commProm).then(function () {
					$.when.apply($, postProm).then(function () {
						$.get("/temps/lfTemp.hjs", function (post) {
							$('#posts').html('');
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
											text: $('.commText', box).val()
										}
									})
									.done(function (response) {
										console.log(response);
										var data = response.data;
										$.when.apply($, blankProm).then(function () {
											commAppend(data, p_id);
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
	});
});