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