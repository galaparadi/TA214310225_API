var hbs = require('hbs');
var path = require('path');

hbs.registerPartials(path.join(path.dirname(__dirname),'/views/partials'));
hbs.registerHelper("workspace", function(context, options){
	var items = {
		names: []
	}

	items.names = context.map(function(val){
		return val.name;
	});
	
	return options.fn(items);
});