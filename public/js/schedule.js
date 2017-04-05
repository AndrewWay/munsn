$(document).ready(function () {

	/***************************
	 * Get calendar.
	 *
	 * @params: uid
	 *
	 * Gets users associated calendar and place in page.
	 ****************************/

	//Attempt to make a new calendar.
	//TODO: Should this be made on registration? Probably.
	$.post("/content/calendar/user/session", function (result) {
		if (result.data) {
			$("#calendar").html('<iframe src="https://calendar.google.com/calendar/embed?showPrint=0&amp;mode=WEEK&amp;height=600&amp;wkst=1&amp;bgcolor=%23FFFFFF&amp;src=' + result.data.id + '&amp;color=%230F4B38&amp;ctz=America%2FSt_Johns" style="border-width:0" width="800" height="600" frameborder="0" scrolling="no"></iframe>');
		}

	});

	//Get the calendar and display it in page.
	$.get("/content/calendar/user/session", function (result) {
		if (result.data) {
			$("#calendar").html('<iframe src="https://calendar.google.com/calendar/embed?showPrint=0&amp;mode=WEEK&amp;height=600&amp;wkst=1&amp;bgcolor=%23FFFFFF&amp;src=' + result.data.id + '&amp;color=%230F4B38&amp;ctz=America%2FSt_Johns" style="border-width:0" width="800" height="600" frameborder="0" scrolling="no"></iframe>');
		}

	});

	/**********************
	 * DateTimePicker
	 *
	 * @params: null
	 *
	 * Initialize the data and time picker for events
	 **********************/

	//Initialize end time picker
	$('#endTime').datetimepicker({
		startDate: '0',
		minTime: new Date()
	});

	//Intialize start time
	$('#startTime').datetimepicker({
		startDate: '0',
		minTime: new Date(),
	});



	/**********************
	 * Add events
	 *
	 * @params: null
	 *
	 * RRule stuff
	 **********************/

	var days, freq;

	days = [RRule.MO, RRule.TU, RRule.WE, RRule.TH, RRule.FR, RRule.SA, RRule.SU];
	freq = [null, RRule.DAILY, RRule.WEEKLY, RRule.MONTHLY];



	$("#addEvent").click(function () {
		var rule;
		var dayList = [];

		console.log($('input[name=freq]:checked').val());
		console.log(freq[$('input[name=freq]:checked').val()]);

		$('input[name="byweekday"]:checkbox:checked').each(function (k, v) {
			dayList.push(days[$(this).val()]);
		});


		rule = new RRule({
			freq: freq[$('input[name=freq]:checked').val()],
			byweekday: dayList,
			until: $('#until').val()
		});

		var evnt = {
			'start': {
				'dateTime': (new Date($('#sTime').val())).toISOString(),
				'timeZone': 'America/St_Johns'
			},
			'end': {
				'dateTime': (new Date($('#eTime').val())).toISOString(),
				'timeZone': 'America/St_Johns'
			},
			'recurrence': ['RRULE:' + rule.toString()],
			'summary': $('#summary').val(),
			'description': $('#description').val()
		};
		$.post("/content/calendar/events/session", evnt, function (result) {
			console.log(result)
		});
	});

});