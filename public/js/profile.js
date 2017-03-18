$(document).ready(function () {
	$("#postBox #text").focus(function () {

		$("#infoContainer").animate({
			height: "300px"
		}, 200);
		$("#postBox #text").animate({
			height: "110px"
		}, 200);


	});

	$("#postBox #text").focusout(function () {

		$("#infoContainer").animate({
			height: "220px"
		}, 200);
		$("#postBox #text").animate({
			height: "30px"
		}, 200);


	});
});