function Test(){
	var data = {"list" : [
		{
			"email": "abc@example.com",
			"name": "abc",
			"date": "05/01/2015"
		},
		{
			"email": "xyz@example.com",
			"name": "xyz",
			"date": "05/01/2015"
		}
	]};
	var temp = '';
	var template = Hogan.compile("{{#list}} Your name is {{name}} and email is {{email}} <br/>{{/list}}");
	var output = template.render(data);
	jQuery('#data').html(output);
}