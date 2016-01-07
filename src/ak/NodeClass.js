/**
 * 
 * @class NodeClass
 */
Package('ak.*');
var NodeClass = ak.NodeClass = class NodeClass extends Element {
	
	// _initialized: false,
	
	NodeClass()
	{
		//console.emit(/instance/, 'group', 'Class %cNodeClass%c inherits:', ''.CORE, '');
		//console.html('<group level="instance">Class <span c="core class">NodeClass</span> inherits:</group>');
		console.html('<group level="instance" c="instance"><span c="icon instance">.</span>Class <span c="core class">NodeClass</span> inherits:</group>');
		// this._super();
		this.implementStyle();
		
		this.$el = $(this);
		this._target = this;
		// localScript(this.$el);
		
		
		if(this.id != '')
			window[this.id] = this;
		
		document.documentElement.addEventListener( 'preinitialize', this.preinitialize.bind(this) );
		document.documentElement.addEventListener( 'initialize', this.initialize.bind(this) );
		
		//console.emit(/instance/, 'groupEnd');
		console.html('<groupEnd level="instance"/>');
	}
	
	_eventAttribute( eventName )
	{
		var _this = this;
		this.$el.on(eventName, function (event)
		{
			eval('(function(){' + (_this.$el.attr('on' + eventName) || '') + '})').call(_this, event);
		});
		//console.emit(/event/, 'info', '%cEvent%c%s%c attribute listening on %o', ''.EVENT, ''.EVENT_TYPE, eventName, '', this.$el[0]);
		console.html('<info level="event"><event attribute type="'+eventName+'" icon="attr">target</event>', {target: this});
	}
	
	preinitialize()
	{
		console.html('<group level="event"><o>node</o><span c="method">.preinitialize()</span></group>', {node: this});
		
		// Set attributes has properties
		var _ownerElement = this;
		$( this.attributes ).each(function ()
		{
			// console.log(this, _ownerElement);
			var _attr = this;
			if( ak.NodeClass.avoidAttribute.indexOf( this.nodeName ) == -1 )
			{
				var prop = Object.getOwnPropertyNames( _ownerElement )
								.filter(function(n)
								{
									return n.toLowerCase() == _attr.nodeName;
								})
								[0];
				if( prop )
					
				// for( var n in _ownerElement )
					// if( n.toLowerCase() == this.nodeName )
					{
						var res = _ownerElement[prop] = this.parse()
						//_ownerElement[n] = eval('('+this.nodeValue+')');
						console.html('<info level="initialize">Attribute parsing: <o>attr</o> = <o>res</o></group>', {attr: this, res: res});
					}
			}
		});

		console.html('<groupEnd level="event"/>');
	}
	
	initialize()
	{
		if( this._initialized ) return;
		console.html('<group level="event"><o>node</o><span c="method">.initialize()</span></group>', {node: this});

		this.children.length && this._reappend();
		
		// for( var i = 0, c; (c = this.children[i++]) && c.initialize && c.initialize(); )
		for( var i = 0, c; c = this.children[i++]; )
		{
			c.initialize && c.initialize();
		}
		
		this._initialized = true;
		
		this.dispatchEvent(new CustomEvent('initialized'));
		console.html('<groupEnd level="event"/>');
	}
	
	// _appendChild: Node.prototype.appendChild,
	appendChild( child )
	{
		console.html('<group level="event" file><o>node</o><span c="method">.appendChild(<o>child</o>)</span></group>', {node: this, child: child});
		
		super.appendChild( child );
		// var e = new BaseEvent('childAdded');
		var e = new CustomEvent('childAdded');
		e.child = child;
		
		/*console.emit(/event/, 'groupCollapsed', 
						'%cEvent%cchildAdded%c sent by %o\n%o', 
							''.EVENT,
							''.EVENT_TYPE,
							'', 
							this, child);*/
		//console.emit(/event/, 'log', e);
		this.dispatchEvent(e);
		//console.emit(/event/, 'groupEnd');
		console.html('<groupEnd level="event"/>');
	}
	
	_reappend()
	{
		console.html('<group level="event"><o>node</o><span c="method">._reappend()</span></group>', {node: this});
		
		var childs = [].slice.call( this.childNodes );
		for( var i = 0, child; child = childs[i++]; )
			this.appendChild( child );
		
		console.html('<groupEnd level="event"/>');
	}
	
	/**
	 * override this method with your layout logic
	 */
	layout()
	{
		
	}
	
	_onResize()
	{
		this.layout();
	}
	
}

ak.NodeClass.avoidAttribute = 'id class style src'.split(' ');


Attr.prototype.parse = function()
{
    var _attr = this;
    if( this.value[ 0 ] == '{' && this.value[ this.value.length-1 ] == '}' )
    {
        //var a = this.name.split( ':' );
        //this._name = a[0];
        //this._type = a[1];
        this._value = 0[0]; // undefined
        try
        {
            this._value = eval('('+this.value.substr(1, this.value.length-2)+')');
        } catch(e) {}
    }
    else if( this.name.indexOf('on') === 0 )
    {
    	this.ownerElement._target && 
			this.ownerElement._target.addEventListener( this.name.substring(2), function(e)
			{
				eval('(function(){' + (_attr.value || '') + '})').call( this, e );
			});
    }
    else
    {
        var val = this.value,
            int = parseInt( val ),
            flo = parseFloat( val ),
            isHex = val.indexOf('0x') == 0,
            nul = val == 'null',
            undef = val == 'undefined',
            isTrue = val == 'true',
            isFalse = val == 'false';
        //this._name = this.name;
		this._value = isHex ? int : !isNaN(flo) ? flo : val;
		
		if(isTrue||isFalse) this._value = isTrue;
		if(nul) this._value = null;
		if(undef) this._value = 0[0];

        //this._value = isHex ? int : flo || val;
    }
	return this._value;
};
Attr.prototype.applyTo = function( target )
{
    eval('target.' + this.name +' = this._value || this.value;');
};