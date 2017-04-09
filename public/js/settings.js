var accVisible = false;
var imgBool = false;
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
	$('#profImgDisp').click(function () {
		$('#profImgUp').click();
	});
	//Update the input file field.
	$("#profImgUp").change(function () {
		imgBool = true;
		$("#profImgDisp").attr("src", window.URL.createObjectURL(this.files[0]));
		$("#profImgDisp").css({
			display: 'block'
		});
	});
	$("#confirmChange input[type=button]").click(function () {
		var newPass = $('#newPass input[type="password"]');
		if (session.user.pass === $('#confirmChange input[type=password]').val() || !session.user.auth) {
			$('#confirmChange input[type=password]').effect("highlight", {
				color: "#33b681"
			}, 500);
			if (newPass[0].value === newPass[1].value || (newPass[0].value.length + newPass[1].value.length) === 0) {
				if ($('#newEmail input').val().indexOf('@mun.ca') !== -1 || !($('#newEmail input').val().length)) {
					var jReq = {
						fname: $('#newName input[name=fName]').val().length ? $('#newName input[name=fName]').val() : undefined,
						lname: $('#newName input[name=lName]').val().length ? $('#newName input[name=lName]').val() : undefined,
						pass: $('#newPass input[type="password"]')[0].value.length ? $('#newPass input[type="password"]')[0].value : undefined,
						email: $('#newEmail input').val().length ? $('#newEmail input').val() : undefined,
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
								if (imgBool) {
									var picForm = new FormData();
									picForm.append("image", $("#profImgUp")[0].files[0]);
									$.ajax({
										xhr: function () {
											var xhr = new window.XMLHttpRequest();
											xhr.upload.addEventListener("progress", function (evt) {
												if (evt.lengthComputable) {
													var percentComplete = evt.loaded / evt.total;
													percentComplete = parseInt(percentComplete * 100);
													$("#imgProgress").progressbar({
														value: percentComplete
													});
													if (percentComplete === 100) {

													}
												}
											}, false);
											return xhr;
										},
										url: '/content/image/profile/session',
										type: 'post',
										data: picForm,
										cache: false,
										contentType: false,
										processData: false

									}).done(function (response) {
										console.log("image uploaded");
										$('#confirmChange').effect("highlight", {
											color: "#33b681"
										}, 500);
										window.setTimeout(function () {
											window.location.reload();
										}, 500);
									});
								} else {
									$('#confirmChange').effect("highlight", {
										color: "#33b681"
									}, 500);
									window.setTimeout(function () {
										window.location.reload();
									}, 500);
								}
								break;
							case 'fail':
								if (imgBool) {
									var picForm = new FormData();
									picForm.append("image", $("#profImgUp")[0].files[0]);
									$.ajax({
										xhr: function () {
											var xhr = new window.XMLHttpRequest();
											xhr.upload.addEventListener("progress", function (evt) {
												if (evt.lengthComputable) {
													var percentComplete = evt.loaded / evt.total;
													percentComplete = parseInt(percentComplete * 100);
													$("#imgProgress").progressbar({
														value: percentComplete
													});
													if (percentComplete === 100) {

													}
												}
											}, false);
											return xhr;
										},
										url: '/content/image/profile/session',
										type: 'post',
										data: picForm,
										cache: false,
										contentType: false,
										processData: false

									}).done(function (response) {
										console.log("image uploaded");
										$('#confirmChange').effect("highlight", {
											color: "#33b681"
										}, 500);
										window.setTimeout(function () {
											window.location.reload();
										}, 500);
									})
								} else {
									$('#confirmChange').effect("highlight", {
										color: "#ffb6c1"
									}, 500);
								}
								break;
						}
					});
				} else {
					if (!accVisible) {
						$("#account .setTitle").click();
						window.setTimeout(function () {
							$('#newEmail input').effect("highlight", {
								color: "#ffb6c1"
							}, 500);
						}, 500);
					} else {
						$('#newEmail input').effect("highlight", {
							color: "#ffb6c1"
						}, 500);
					}
				}
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