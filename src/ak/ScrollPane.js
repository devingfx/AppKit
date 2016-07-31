/**
 * ScrollPane Class
 */
Package('iscroll.*');
iscroll.IScroll = IScroll;
iscroll.Bar = class Bar extends NodeClass {
	
	constructor( direction )
	{
		return new Node('iscroll:Bar').extends( null, direction )
	}
	Bar( direction )
	{
		super.NodeClass();
		this.appendChild( new iscroll.Thumb() );
		this.direction = direction || 'vertical';
	}
	get direction()
	{
		return this.getAttribute('vertical') ? 'vertical' : 'horizontal'
	}
	set direction( v )
	{
		if( !this.attributes[v] )
		{
			var nonv = v == 'vertical' ? 'horizontal' : 'vertical';
			this.setAttribute( v, 'true');
			this.removeAttribute( nonv );
		}
	}
	
};

iscroll.Thumb = class Thumb extends NodeClass {
	
	constructor()
	{
		return new Node('iscroll:Thumb').extends()
	}
	Thumb()
	{
		super.NodeClass()
	}
};

Package('ak.*');
var ScrollPane = ak.ScrollPane = class ScrollPane extends Element {
	
	// _verticalScrollPolicy: true,
	// _horizontalScrollPolicy: true,
	constructor( policy )
	{
		var node = new Node('ak:ScrollPane').extends();
		/vertical|both/g.test( policy ) && 
			( node.horizontalScrollPolicy = 'off' )
		/horizontal|both/g.test( policy ) && 
			( node.verticalScrollPolicy = 'off' )
		return node;
	}
	
	ScrollPane()
	{
		console.html('<group level="instance" c="instance"><span c="icon instance">.</span>Class <span c="AppKit class">ScrollPane</span> inherits:</group>');
		
		this.Element();
		this.implementStyle();
		
		
		this._$pane = new Node('pane');
		Array.from( this.childNodes ).map( n => this._$pane.appendChild(n) );
		// this.childNodes.length && $( this.childNodes ).wrapAll( this._$pane );
		this.appendChild( this._$pane );
		
		// Scrollbars
// 		this.$verticalScrollbar = $('<scroll:Bar xmlns:scroll="scroll.*" vertical=""><scroll:Thumb/></scroll:Bar>');
		this.$verticalScrollbar = new iscroll.Bar('vertical');
		this.$verticalScrollbar._indicator = {
			el: this.$verticalScrollbar,
			listenX: false,
			listenY: true,
			fade: true,
			resize: true,
			shrink: 'clip'
		};
// 		this.$horizontalScrollbar = $('<scroll:Bar xmlns:scroll="scroll.*" horizontal=""><scroll:Thumb/></scroll:Bar>');
		this.$horizontalScrollbar = new iscroll.Bar('horizontal');
		this.$horizontalScrollbar._indicator = {
			el: this.$horizontalScrollbar,
			listenX: true,
			listenY: false,
			fade: true,
			resize: true,
			shrink: 'clip'
		};
// 		this.$verticalScrollbar[0].extends();
// 		this.$verticalScrollbar.children()[0].extends();
// 		this.$horizontalScrollbar[0].extends();
// 		this.$horizontalScrollbar.children()[0].extends();
		this.appendChild( this.$verticalScrollbar );
		this.appendChild( this.$horizontalScrollbar );
		
		this._verticalScrollPolicy = true;
		this._horizontalScrollPolicy = true;
		
		this._iScroll = new iscroll.IScroll( this, {
			scrollY: true,
			scrollX: true,
			probeType: 3,
			// freeScroll: true,
			mouseWheel: true,
			// scrollbars: true,
			fadeScrollbars: true,
			// shrinkScrollbars: 'clip'
			indicators: [
				this.$horizontalScrollbar._indicator,
				this.$verticalScrollbar._indicator
			]
		} );
		
		Object.defineProperties( this, {
			horizontalScrollPolicy: {
				get: function ()
				{
					return this._horizontalScrollPolicy;
				},
	
				set: function( v )
				{
					if( /on|off/.test(v) )
					{
						this._horizontalScrollPolicy = /on/.test( v );
						this._iScroll.options.scrollX = this._horizontalScrollPolicy;
						
						var pos = this._iScroll.options.indicators.indexOf( this.$horizontalScrollbar._indicator );
						if( this._horizontalScrollPolicy && pos == -1 )
							this._iScroll.options.indicators.push( this.$horizontalScrollbar._indicator );
						else
							this._iScroll.options.indicators.splice( pos, 1 );
							
						
						// this._horizontalScrollPolicy ? 
						// 	this.$horizontalScrollbar.show() : 
						// 	this.$horizontalScrollbar.hide();
						this._iScroll.refresh();
					}
				}
			},
	
			verticalScrollPolicy: {
				get: function()
				{
					return this._verticalScrollPolicy;
				},
				
				set: function( v )
				{
					if( /on|off/.test(v) )
					{
						this._verticalScrollPolicy = /on/.test( v );
						this._iScroll.options.scrollY = this._verticalScrollPolicy;
						this._verticalScrollPolicy ? 
							this.$verticalScrollbar.show() : 
							this.$verticalScrollbar.hide();
						this._iScroll.refresh();
					}
				}
			}
		});
		
		window.addEventListener('resize', e => this.layout() ); // executes layout()
		// this._onResize();
		
		this.addEventListener('childAdded', e => 
			this._$pane.appendChild( e.child )
		);
		
		console.html('<groupEnd level="instance"/>');
	}
	
	
	
	// get horizontalScrollPolicy()
	// {
	// 	return this._horizontalScrollPolicy;
	// }
	
	// set horizontalScrollPolicy( v )
	// {
	// 	if( /on|off/.test(v) )
	// 	{
	// 		this._horizontalScrollPolicy = /on/.test( v );
	// 		this._iScroll.options.scrollX = this._horizontalScrollPolicy;
	// 	}
	// }
	
	// get verticalScrollPolicy()
	// {
	// 	return this._verticalScrollPolicy;
	// }
	
	// set verticalScrollPolicy( v )
	// {
	// 	if( /on|off/.test(v) )
	// 	{
	// 		this._verticalScrollPolicy = /on/.test( v );
	// 		this._iScroll.options.scrollY = this._verticalScrollPolicy;
	// 	}
	// }
	
	// preinitialize()
	// {
		// this._super();
		// this.layout;
	// }
	
	initialize()
	{
		super.initialize();
		this.layout();
	}
	
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
	
	layout()
	{
		this._iScroll.refresh();
		//console.log(this.$scroller.outerHeight());
	}
}