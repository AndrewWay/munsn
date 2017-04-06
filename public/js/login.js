window.location.hash='';

//Initialized datepicker for registration form.
$(function () {
	$("#datePick").datepicker({
		changeMonth: true,
		changeYear: true,
		yearRange: "-100:-16",
		defaultDate: "-16y-1-1"
	});
});


$(document).ready(function () {
	//When btn is clicked, convert to register page
	$("#regBtn").click(function () {

		$('#textAlert').hide();
		$("#obscure").fadeIn(500);
		$("#loginFields").hide()

		$("#loginPanel").animate({
			width: "400px",
			right: "-8%"
		}, 500, function () {
			$("#loginPanel").animate({
				height: "600px",
				top: "3%"
			}, 500, function () {
				$("#regFields").fadeIn(300)
			})
		});

	});

	$("#closeReg").click(function () {
		//Another option would be to animate the entire body changing background and changing z-index

		$("#regFields").hide()

		$("#loginPanel").animate({
			width: "200px",
			right: "4%"
		}, 500, function () {
			$("#loginPanel").animate({
				height: "400px",
				top: "15%"
			}, 500, function () {
				$("#loginFields").fadeIn(300)
			})
		}); //Testing is needed for this on many screen sizes

		$('#textAlert').hide();
		$("#obscure").fadeOut(500);

	});

	//For now this just shows functionality. Will have to see how integration will work with this.
	$("#picUp").change(function () {
		$("#picDisp").attr("src", window.URL.createObjectURL(this.files[0]));
	});

	/*****************************************************
	 *Handler for registration form submit.
	 *
	 *@params: null
	 *
	 *Checks that form is complete, then submits it.
	 *****************************************************/

	//TODO -- check that password and confirm password are the same.
	//TODO -- Make sure TOS checkbox is clicked.
	//TODO -- Maybe remove requirement on profile picture field?
	$("#regSubmit").click(function () {
		$('#regFields input[name="user"]').val($('input[name="email"]').val().split('@')[0]); //This is only need because user isn't parsed on server
		if (!($("#regFields input").filter(function () {
				//If any field is empty: Clear password fields, highlight empty fields. Display text alert.
				return $.trim($(this).val()).length === 0
			}).length === 0)) {

			$('#regFields input[type="password"]').val('');

			$("#regFields input").filter(function () {
				return $.trim($(this).val()).length === 0
			}).effect("highlight", {
				color: "#ffb6c1"
			}, 500);

			$('#textAlert').css({
				color: 'red'
			});
			$('#textAlert').html('Missing required fields.');
			$('#textAlert').show();

		} else if (!($('#regFields input[name=pass]').val() === $('#regFields input[name=passConf]').val())) {
			//If password fields do not match: Clear fields and highlight. Display text alert.
			$('#regFields input[type="password"]').val('');
			$('#regFields input[type="password"]').effect("highlight", {
				color: "#ffb6c1"
			}, 500);

			$('#textAlert').css({
				color: 'red'
			});
			$('#textAlert').html('Entered passwords do not match');
			$('#textAlert').show();


		} else if (!($('#regFields input[name="checkTOS"]').is(':checked'))) {
			//If TOS agreement is not checked: Clear password fields and TODO: Display text message
			$('#regFields input[type="password"]').val('');

			$('#textAlert').css({
				color: 'red'
			});
			$('#textAlert').html('Must agree to terms of service.');
			$('#textAlert').show();

		} else {
			var dob = $('#regFields #datePick').val().split('/');
			var jqxhr = $.post("/api/register", {
						fname: $('#regFields input[name="fname"]').val(),
						lname: $('#regFields input[name="lname"]').val(),
						email: $('#regFields input[name="email"]').val(),
						pass: $('#regFields input[name="pass"]').val(),
						dob: new Date(dob[2], dob[0] - 1, dob[1]),
						gender: $('#regFields input[name="gender"]:checked').val(),
						address: $('#regFields input[name="addr"]').val()
					},
					function () {
						console.log("post");
					}
				)
				.done(function (result) {
					console.log(result.status);

					if (result.status === 'fail') {
						//If ajax request returns false: Display text alert. Clear all fields.

						$('#textAlert').css({
							color: 'red'
						});

						//TODO: Add other alerts.
						$('#textAlert').html('Account not created: User already exists.');
						$('#textAlert').show();

					} else {
						var picForm = new FormData();
						picForm.append("image", $("#picUp")[0].files[0]);
						//Send multipart/formdata with the image
						$.ajax({
								url: '/content/image/profile/' + result.data._id, //Get :uid from the return.
								type: 'post',
								data: picForm,
								cache: false,
								contentType: false,
								processData: false,

							})
							.done(function (data) {
								console.log("img uploaded");

								//Display text alert to check email
								$('#textAlert').css({
									color: 'black'
								});
								$('#textAlert').html('Account created. Check email for confirmation.');
								$('#textAlert').show();
							})
							.fail(function (data) {
								console.log("img not uploaded");
							})
					}

					$("#regFields")[0].reset();
					$("#picDisp").attr('src', '/img/SEAHAWK_SIL.jpg');



				})
				.fail(function () {
					console.log("failure");

				})
		}

	});

	/*****************************************************
	 *Handler for login form submit.
	 *
	 *@params: null
	 *
	 *Checks that form is complete, then submits it.
	 *****************************************************/

	$("#logSubmit").click(function () {
		if (!($("#loginFields input").filter(function () { //If field is empty highlight it.
				return $.trim($(this).val()).length === 0
			}).length === 0)) {

			$("#loginFields input").filter(function () {
				return $.trim($(this).val()).length === 0
			}).effect("highlight", {
				color: "#ffb6c1"
			}, 500);

			$('#textAlert').css({
				color: 'red'
			});
			$('#textAlert').html('Required fields missing.');
			$('#textAlert').show();

		} else {
			var jqxhr = $.post("/api/login", {
						uid: $('#loginFields input[name="user"]').val(),
						pass: $('#loginFields input[name="pass"]').val(),
					},
					function () {
						console.log("post");
					}
				)
				.done(function (response) {

					if (response.status === 'fail') {
						//Login is not successful: Clear fields. Display text alert.
						$("#loginFields")[0].reset();
						$('#textAlert').css({
							color: 'red'
						});
						$('#textAlert').html('Login failed: Incorrect username or password.');
						$('#textAlert').show();

					} else {
						//Reload page after successful login post.
						window.location.reload("true");
					}
				})
				.fail(function () {
					console.log("failure");

					//TODO: Integration -- Error from server.
				})
		}

	});

	/*****************************************************
	 *Handler for guest sign-in?
	 *
	 *@params: null
	 *
	 *Sign in using guest credentials?
	 *****************************************************/

	$('#guestIn').click(function () {
		//TODO -- Implementation when integrated. Can't currently sign in this way.
		$(location).attr('href', '/');
	});

	/***********************
	 * Other button functions
	 *
	 *@params: null
	 *
	 * Functions and behaviour for various buttons.
	 ************************/

	//Display terms of service when button is clicked.
	$('#tosButton').click(function () {
		$('#tosPop').show();
	});

	//Display prompt for password recovery.
	$('#forPass').click(function () {
		$('#fpPop').show();
	});

	//When username is submitted, send email with password recovery.
	$('#fpSubmit').click(function () {
		//TODO: Integrate forgot password api call. Does this exist?

		//When done, change text to confirm.
	});

	//If popup close button pressed, close that popup.
	$('.popClose').click(function () {
		$('.popup').hide();
	});

});