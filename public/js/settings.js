var accVisible = false;
$(document).ready(function () {

	/******************
	 * Dropbox
	 *
	 *@params: null
	 *
	 * Functions for expanding and contracting the option boxes
	 ******************/

	//Expand when contracted, contract when expanded
	$(".setTitle").click(function (sett) {
		if ($(this).parent().height() + 1 < $(this).height() + $(this).next().height()) {
			$(this).parent().animate({
				height: $(this).height() + $(this).next().height()
			});
			accVisible = true;
		} else {
			$(this).parent().animate({
				height: $(this).height()
			});
			accVisible = false;
		}
	});
	$("#confirmChange input[type=button]").click(function () {
		var newPass = $('#newPass input[type="password"]');
		console.log(newPass);
		console.log(newPass);
		if (session.pass === $('#confirmChange input[type=password]').val()) {
			if (newPass[0].value === newPass[1].value || (newPass[0].value.length + newPass[1].value.length) === 0) {
				var jReq = {
					pass: newPass[0].value,
					email: undefined,
					visibility: undefined,
					address: undefined,
					gender: $('#account input[name=gender][checked]').val()
				};
			} else {
				if (!accVisible) {
					$("#account .setTitle").click();
					window.setTimeout(function () {
						newPass.effect("highlight", {
							color: "#ffb6c1"
						}, 500);
					}, 500);
				} else {
					newPass.effect("highlight", {
						color: "#ffb6c1"
					}, 500);
				}
			}
		} else {
			$('#confirmChange input[type=password]').effect("highlight", {
				color: "#ffb6c1"
			}, 500);
		}
	});
});