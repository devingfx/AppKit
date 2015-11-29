/* Attribute bindings setup
 * 
 * <tag on[event on document]:[property]="text! {javascript} text {javascript} ...">
 * Adds an event listener on document for the event spécified before semicolon (:) that will
 * set the style property using eval() to execute javascript between brackets ({}) in the attribute value.
 * 
 * Exemple : 	<header onwindowresize:style.height="{window.innerHeight}px">
 * 				will evaluate headerNode.style.height = "" + window.innerHeight + "px"
 * 				each time "windowresize" custom event is fired on document
 * 				PS:	We have here to setup an eventListener on window for "resize" event to manualy fire 
 * 					a "windowresize" event on document : window.addEventListener('resize', function()
 * 					{
 *						document.dispatchEvent(new Event('windowresize'));
 *					});
 * 
 */

var BaseEvent = function(type, bubbles, cancelable)
{
	if(typeof type == 'undefined' || type == null || type == "")
		throw new Error("type is required!");
	this.type = type;
	this.bubbles = typeof bubbles == 'undefined' ? false : bubbles;
	this.cancelable = typeof cancelable == 'undefined' ? false : cancelable;
	this.cancelBubble = false;
	this.clipboardData = undefined;
	this.currentTarget = null;
	this.defaultPrevented = false;
	this.eventPhase = 0;
	this.returnValue = true;
	this.srcElement = null;
	this.target = null;
	this.timeStamp = new Date().getTime();
}

var EventDispatcher = function(obj)
{
	obj = obj || this;
	if(typeof obj != 'undefined')
	{
		obj._listeners = {},
		obj.addEventListener = function(type, handler)
		{
			this._listeners[type] = this._listeners[type] || [];
			this._listeners[type].push(handler);
			return this;
		},
		
		// Pas testé
		obj.removeEventListener = function(type, handler)
		{
			if(this._listeners[type] && this._listeners[type].indexOf(handler) != -1)
				this._listeners[type].splice(this._listeners[type].indexOf(handler), 1);
			return this;
		},

		obj.dispatchEvent = function(evt)
		{
			if(evt instanceof BaseEvent)
			{
				evt.target = obj;
				evt.currentTarget = obj;
				// console.log(obj, Object.getOwnPropertyDescriptor(evt, 'target'));
				// console.log(Object.getOwnPropertyDescriptor(evt, 'currentTarget'));
				if(this._listeners[evt.type])
					for(var i = 0, listener; listener = this._listeners[evt.type][i]; i++)
						listener(evt);
				
			}
			return this;
		}
	}
}

// tests EventDispatcher
// aze={aze:42,coucou:function monde(msg){alert('hello '+msg);}}
// var handler = function(e){e.target.coucou("aze vaut : "+e.target.aze)};
// EventDispatcher(aze);
// aze.addEventListener('aze', handler);
// aze.dispatchEvent(new BaseEvent('aze'));


var bindings = function(el, recursive)
{
	recursive = typeof recursive == 'undefined' ? true : recursive;
	if(el && el.nodeType == 1)
	{
		// Loop on attributes
		for(var attr, reg, i = 0; attr = el.attributes[i]; i++)
			// If attribute contains brackets {} and is not an event listener Ex: onload, onchange, ...
			if(attr.value.toString().indexOf('{') != -1 && attr.localName.toString().indexOf('on') != 0)
			{
				// if(attr.localName.toString().indexOf(':') != -1)
					// console.log(attr.localName.toString(), attr.value.toString(), attr.localName.toString().match(/(.*):(.*)/))
				if(reg = attr.localName.toString().match(/(.*):(.*)/))
				{
					var source = reg[1],
						destination = reg[2],
						arr = source.split('.'),
						event = arr.pop();
						source = arr.join('.');


					// Do a bridge between lowercase property and case sensitive: ex: innerHTML
					source = bindings.realName(window, source)[0];
					destination = bindings.realName(el, destination)[1];
					// console.log(3, source, event, destination);

					// TODO: parse attribute value, find all vars and add listener on propertyChange
					//console.log(attr.value.toString().match(/[A-Za-z_$]+[A-Za-z_$0-9.("')]*/g));
					var binder = (function(attr, prop)
					{
						return function(event)
						{
							var v = bindings.eval(attr.value.toString());
							eval("el."+prop+"=v;");

							// try{
							// 	// console.log('binder',prop, eval(	attr.value.toString().replace(/\{(.*)\}/g, "($1)")		));
							// 	var test = attr.value.toString().match(/\{([^}]*)\}/g);
							// 	if(test.length == 1 && test[0] == attr.value) // Only 1 bracket and no text outside
							// 		eval(	"el."+prop+" = " + attr.value.toString().replace(/\{(.*)\}/g, "($1)")		);
							// 	else
							// 		eval(	"el."+prop+" = \"" + attr.value.toString().replace(/\{([^}]*)\}/g, "\" + ($1) + \"") + "\""	);
							// 	// console.log(	"el."+prop+" = \"" + attr.value.toString().replace(/\{([^}]*)\}/g, "\" + ($1) + \"") + "\""	);
							// }catch(e){}
						};
					})(attr, destination);
					source.addEventListener(event, binder);
					// binder();
				}
			}

		if(recursive)
			for(var child, i = 0; child = el.childNodes[i]; i++)
				if(child.nodeType == 1)
					bindings(child);
	}
}
bindings.eval = function(str)
{
	try{
		var fullReg = /\{{1,2}(.*?)\}{1,2}/g,
			oneReg = /\{(.*?)\}/g,
			twoReg = /\{(.*?)\{(.*?)\}\}/g;


		// console.log('binder',prop, eval(	attr.value.toString().replace(/\{(.*)\}/g, "($1)")		));
		var test = str.match(/\{(.*?)\}/g);
		var test = str.match(/\{{1,2}(.*?)\}{1,2}/g), code;
		if(test != null && test.length == 1 && test[0] == str) // Only 1 bracket and no text outside
			code = str.replace(/\{(.*)\}/g, "($1)");
		else
			code = '"' + str.replace(/\{([^}]*)\}/g, "\" + ($1) + \"") + '"';
		// console.log(	"el."+prop+" = \"" + attr.value.toString().replace(/\{([^}]*)\}/g, "\" + ($1) + \"") + "\""	);
		
		return eval(code);
	}catch(e){return str;}
}
bindings.realName = function(object, prop)
{
		
	var propPath = prop.split('.'), 
		curProp, 
		target = object, 
		realPropPath = [];
	
	// console.log(1, object, prop, propPath);

	if(prop == "")
		return [object, prop];
	while(propPath.length > 0)
	{
		curProp = propPath.shift();
		// if(curProp == "document")
		// 	continue;
		for(var n in target) //console.log(n)
			if(n != "Document" && curProp == n.toLowerCase())
				curProp = n;
		realPropPath.push(curProp);
		target = target[curProp];
		
		// console.log(2, target, curProp);
		// console.log(curProp, target);
	}
	return [target, realPropPath.join('.')]
}
// Usage:			bindings(document.getElementsByTagName('header')[0]);
// Or all nodes: 	for(var el, i = 0; el = document.body.children[i]; i++) bindings(el);
/*
(document.addEventListener || document.attachEvent).call(document, 'bindings.ready', function()
{
	// console.log("aaaaaaaaaa");
	// bindings(document.body);
	// setTimeout(function(){document.dispatchEvent(new Event('appready')); }, 1000);
	// window.addEventListener('resize', function()
	// {
	// 	document.dispatchEvent(new Event('windowresize'));
	// });
	// document.dispatchEvent(new Event('windowresize'));
});
*/