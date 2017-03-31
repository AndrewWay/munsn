$(document).ready(function() {
	
	/******************
	* Map functions
	*
	* @params: null
	*
	* Functions used to display and use locationPicker map.
	*******************/
	
	//Display or hide the map.
	$('.mapToggle').click(function() {
		if($('#mapHolder').css("width") == "550px"){
			$("#mapHolder").animate({width: "0px" }, 200);			
		}
		else{
			$("#mapHolder").animate({width: "550px"	}, 200);
		}
	});
	
	//Initialize the map and set input fields.
	$('#map').locationpicker({
		location: {latitude: 47.5738, longitude: -52.7329},
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
	$('#lostChoice').click(function(){
		if($('#lostContent').css("display") == "none"){
			$('#foundChoice').css({boxShadow: "none"});
			$('#lostChoice').css({boxShadow: "1px 1px 5px #555 inset"});
			$('#foundContent').toggle();
			$('#lostContent').toggle();
		}
		else{
			//Do nothing.
		}
	});
	
	//Display found fields if found is clicked.
	$('#foundChoice').click(function(){
		if($('#foundContent').css("display") == "none"){
			$('#lostChoice').css({boxShadow: "none"});
			$('#foundChoice').css({boxShadow: "1px 1px 5px #555 inset"});
			$('#lostContent').toggle();
			$('#foundContent').toggle();
		}
		else{
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
	$('#lostImgDisp').click(function(){
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
		//Send the object to API
		//This def doesn't work yet :)
		console.log("in the submitLost function")
		var jqxhr = $.post("/api/lostfound", 
			{
				latitude: $('#lostContent input[name="lat"]').val(),
				longitude: $('#lostContent input[name="long"]').val(),
				locate: $('#lostContent input[name="locate"]').val(),
				name: $('#lostContent input[name="name"]').val(),
				phone: $('#lostContent input[name="phone"]').val(),
				email: $('#lostContent input[name="email"]').val()
			},
			function () 
			{
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
					$('#textAlert').html('Uh oh. Bad thing happened');
					$('#textAlert').show();
				} 
				else 
				{
					//Upload the pic
				}
				$("#lostContent")[0].reset();
		});
	});	
});
