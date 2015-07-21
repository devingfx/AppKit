(function(exports){


var html = document.firstElementChild;
// html.setAttribute('xmlns:ppm', 'http://www.test.com');
html.xmlns = {};
html.xmlns.ppm = {prefix: 'ppm', uri: 'http://maps.118712.fr/'};
html.xmlns.ppm.Aze = function()
{
	// this == node
	console.log('priv: ',this.private);
};
html.xmlns.ppm.Aze.prototype = {
	template: '<div>Coucou: <content select="span"></content></div>'
};


document.createComponent = function(QName)
{
	var ns;
	QName = QName.split(':');
	
	if(QName.length > 1 && (ns = html.xmlns[QName[0]]) )
	{
		var node = document.createElementNS(ns.uri, QName.join(':') );
		var klass = ns[QName[1]];
		var root = node.webkitCreateShadowRoot();
		if(klass)
		{
			var old = node.private;
			node.private = root;
			for(var n in klass.prototype)
				node[n] = klass.prototype[n];
			klass.apply(node);
			// node.private = old;
		}
		
		if(node.template)
			root.innerHTML = node.template;
		
		var styleNode = document.createElement('style'),
			sheet = document.createElement('div').style;
		root.appendChild(styleNode);
		//root.innerHTML += '<style>@host{ *{ display:block; height:50px;} }</style>'

		var _setProperty = sheet.setProperty;
		sheet.setProperty = function()
		{
			_setProperty.apply(sheet, arguments);
			var css = '';
			for(var i = 0; i < sheet.length; i++)
				css += sheet[i] + ': ' + sheet[sheet[i]] + ';' ;
			
			styleNode.innerHTML = '@host{ *{ '+css+' } }';
		}
			
		/*
		for(var n in sheet)
		{
			Object.defineProperty(style, n, {get: function(){}, set: function(v){style} });
		}
		*/
		
		Object.defineProperty(node, 'style', {
			get: function()
			{
				return sheet;
			}
		});
		
		return node;
	}
	else
	{
		return document.createElement(QName.join(':'));
	}
	

}








})(window);