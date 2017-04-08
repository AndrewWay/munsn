var accVisible = false;
$(document).ready(function () {
	$('#account input[name=gender][value=' + session.user.gender + ']').prop('checked', true);
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
		if (session.user.pass === $('#confirmChange input[type=password]').val()) {
			if (newPass[0].value === newPass[1].value || (newPass[0].value.length + newPass[1].value.length) === 0) {
				$('#confirmChange input[type=password]').effect("highlight", {
					color: "#33b681"
				}, 500);
				var jReq = {
					pass: $('#newPass input[type="password"]')[0].value.length ? $('#newPass input[type="password"]')[0].value : undefined,
					email: undefined,
					visibility: undefined,
					address: $('#newAddr input[name=addr]').val().length ? $('#newAddr input[name=addr]').val() : undefined,
					gender: $('#account input[name=gender]:checked').val() != session.user.gender ? $('#account input[name=gender]:checked').val() : undefined
				};
				$.ajax({
					method: 'patch',
					url: '/api/user/session',
					data: jReq
				}).done(function (result) {
					console.log(result.status);
					switch (result.status) {
						case 'ok':
							$('#confirmChange').effect("highlight", {
								color: "#33b681"
							}, 500);
							window.setTimeout(function () {
								window.location.reload();
							}, 500);
							break;
						case 'fail':
							$('#confirmChange').effect("highlight", {
								color: "#ffb6c1"
							}, 500);
							break;
					}
				});
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