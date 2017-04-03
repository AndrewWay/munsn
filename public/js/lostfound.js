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
		//Read in information from lost and found div
		var jqxhr = $.post("/api/lostfound", 
			{
				description: $('#lostContent input[name="desc"]').val(),
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
				//If ajax request returns false: display error in console
					console.log("Oh no. Something bad happened");
				} 
				else 
				{
					var picForm = new FormData();
					picForm.append("image", $("#lostImg")[0].files[0]);
					//Send multipart/formdata with the image
					$.ajax({
						url: '/content/image/profile/' + result.data._id, //Get :lostfoundid from the return.
						type: 'post',
						data: picForm,
						cache: false,
						contentType: false,
						processData: false,
					}).done(function (data) {
						console.log("img uploaded");
						//Display text alert to check email
						$('#textAlert').css({
							color: 'black'
						});
						$('#textAlert').html('Account created. Check email for confirmation.');
						$('#textAlert').show();
					}).fail(function (data) {
						console.log("img not uploaded");
					})
				}
			$("#lostContent")[0].reset();
		});
	});	
});
