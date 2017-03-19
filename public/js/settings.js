$(document).ready(function () {

	$(".setTitle").click(function (sett) {
		if ($(this).parent().height() < $(this).height() + $(this).next().height()) {
			$(this).parent().animate({
				height: $(this).height() + $(this).next().height()
			});
		} else {
			$(this).parent().animate({
				height: $(this).height()
			});
		}
	});

});