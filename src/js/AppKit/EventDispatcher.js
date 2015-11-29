var BaseEvent = Class.extend({
	construct: function( type, bubbles, cancelable )
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
});

console.html && (
	console.html.event = function( node, data )
	{
		var cls = (node.attributes.c ? ' '+node.attributes.c.value : '') + (node.attributes.class ? ' '+node.attributes.class.value : '') + ' '+node.attributes.type.value,
			tpl = (node.attributes.icon ? '<span c="icon '+node.attributes.icon.value+'">.</span>' : '') +
					'<span c="event'+cls+'">Event'+(node.attributes.attribute ? ' attribute' : '')+'</span><br/>\
					<span c="type">'+node.attributes.type.value+'</span>\
					<span style="color: blue;text-shadow:none;font-weight:normal"> '+ (node.attributes.icon  && /listen|attr/.test(node.attributes.icon.value) ? 'est écouté sur' : 'a été lancé par')+' <o>'+node.innerText+'</o></span>',
			span = document.createElement('span');
		span.innerHTML = tpl;
		span.className = 'event' + cls;
		node.nextSibling ? node.parentNode.insertBefore( span, node.nextSibling ) : node.parentNode.appendChild( span );
	}
);


var EventDispatcher = Class.extend({
	construct: function( obj )
	{
		/*
		console.emit(/instance/, 'group', 'Class %cEventDispatcher%c inherits:', ''.CORE, '');
		console.emit(/instance/, 'log', '%cClass %cClass%c', 'font-weight:bold;', ''.CORE, '');
		console.emit(/instance/, 'groupEnd');
		*/
		//console.html('<group level="instance" c="event"><span c="icon instance">.</span>Class <span c="core class">EventDispatcher</span> inherits:</group>');
		console.html && console.html('<group level="instance" c="instance"><span c="icon instance">.</span>Class <span c="core class">EventDispatcher</span> inherits:</group>');
		
		
		//console.html('<log level="instance">Class <span c="core class">Class</span></log>');
		//this._super();
		
		obj = obj || this;
		isDOM = obj instanceof Element;
		if( obj )
		{
			obj._listeners = {};
			var _addEventListener = obj.addEventListener && obj.addEventListener.bind( obj );
			obj.addEventListener = obj.on = function(type, handler, bubble )
			{
				/*console.emit(/event/, 'groupCollapsed', 
							'%cEvent%c'+type+'%c caught by %o\n%O', 
							''.EVENT,
							''.EVENT_TYPE, '',
							this);*/
				console.html && console.html('<group collapsed level="event" file><event c="'+obj.constructor.name+'" type="'+type+'" icon="listen">target</event></group>', {target: this});
				
				this._listeners[type] = this._listeners[type] || [];
				this._listeners[type].push( handler );
				_addEventListener && _addEventListener( type, handler, bubble );
				
				console.html && console.html('<groupEnd level="event"/>');
				return this;
			};
			
			// Pas testé
			var _removeEventListener = obj.removeEventListener && obj.removeEventListener.bind( obj );
			obj.removeEventListener = obj.off = function(type, handler, bubble )
			{
				if(this._listeners[type] && this._listeners[type].indexOf(handler) != -1)
					this._listeners[type].splice(this._listeners[type].indexOf(handler), 1);
				_removeEventListener && _removeEventListener( type, handler, bubble );
				return this;
			};
	
			var _dispatchEvent = obj.dispatchEvent && obj.dispatchEvent.bind( obj );
			obj.dispatchEvent = obj.fire = function(evt)
			{
				/*console.emit(/event/, 'groupCollapsed', 
							'%c    %cEvent%c'+evt.type+'%c sent by %o\n%O', 
							''.EVENT_DISP,
							''.EVENT,
							''.EVENT_TYPE, '',
							this, evt);*/
				if( !(evt.type == 'childAdded' && evt.child.nodeType == 3) )
					console.html && console.html('<group collased level="event.*'+obj.constructor.name+'" file><event c="'+obj.constructor.name+'" type="'+evt.type+'" icon="emit">target</event><br/><o>e</o></group>', {target: this, e: evt});
	
				if( isDOM )
				{
					_dispatchEvent( evt );
					
				}
				else
				{
					Object.defineProperty(evt, 'target', {get: function(){return obj}})
					Object.defineProperty(evt, 'currentTarget', {get: function(){return obj}})
					// console.log(obj, Object.getOwnPropertyDescriptor(evt, 'target'));
					// console.log(Object.getOwnPropertyDescriptor(evt, 'currentTarget'));
					if(this._listeners[evt.type])
						for(var i = 0, listener; listener = this._listeners[evt.type][i]; i++)
							listener(evt);
				}
	
				if( !(evt.type == 'childAdded' && evt.child.nodeType == 3) )
					console.html && console.html('<groupEnd level="event"/>');
				return this;
			}
		}
	
		console.html && console.html('<groupEnd level="instance"/>');
	}
});
