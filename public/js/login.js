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
		//Another option would be to animate the entire body changing background and changing z-index
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
		}); //Testing is needed for this on many screen sizes

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

	$("#regSubmit").click(function () {
		$('#regFields input[name="user"]').val($('input[name="email"]').val().split('@')[0]); //This is only need because user isn't parsed on server
		if (!($("#regFields input").filter(function () { //If field is empty highlight it.
				return $.trim($(this).val()).length === 0
			}).length === 0)) {

			$("#regFields input").filter(function () {
				return $.trim($(this).val()).length === 0
			}).effect("highlight", {
				color: "#ffb6c1"
			}, 500);

		} else {
			var dob = $('#regFields #datePick').val().split('/');
			var jqxhr = $.post("/api/user/register", {
						fname: $('#regFields input[name="fname"]').val(),
						lname: $('#regFields input[name="lname"]').val(),
						email: $('#regFields input[name="email"]').val(),
						pass: $('#regFields input[name="pass"]').val(),
						dob: new Date(dob[2], dob[0] - 1, dob[1]),
						gender: $('#regFields input[name="gender"]').val(),
						address: $('#regFields input[name="addr"]').val()
					},
					function () {
						console.log("post");
					}
				)
				.done(function () {
					console.log("success");
					$("#regFields")[0].reset();
					//$("#someDiv").val("Check yo email");
				})
				.fail(function () {
					console.log("failure");
					//$("#someDiv").val("Is no good");
					//Maybe change some colours depending on failure?
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

		} else {
			alert("NOTE: Data will not be filled. Integration milestone.");
			var jqxhr = $.post("/api/user/login", {
						uid: $('#loginFields input[name="user"]').val(),
						pass: $('#loginFields input[name="pass"]').val(),
					},
					function () {
						console.log("post");
					}
				)
				.done(function () {
					console.log("success");
					console.log(JSON.stringify(jqxhr.responseJSON));
					window.location.reload("true");	//Reload page after successful login post.
					//TODO: Integration -- Go to portal with session token.
				})
				.fail(function () {
					console.log("failure");

					//TODO: Integration -- Error from server.
				})
		}

	});

	/*****************************************************
	 *Handler for guest sign-in.
	 *
	 *@params: null
	 *
	 *Sign in using guest credentials?
	 *****************************************************/

	$('#guestIn').click(function () {
		$(location).attr('href', '/');
	});

});